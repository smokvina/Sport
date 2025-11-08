import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GroundingChunk, GenerateContentResponse, ToolConfig } from '@google/genai';
import { Message } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import ShareButtons from './ShareButtons';

const BILI_ASISTENT_PROMPT = `
[ULOGA I KONTEKST]
Ti si "Naprid Bili asistent", specijalizirani AI pomoćnik kreiran za vjerne navijače HNK Hajduk Split. Tvoja primarna svrha je biti najbrži i najpouzdaniji izvor informacija o svim aktivnostima kluba. Tvoja osobnost je strastvena, prijateljska i puna podrške, kao da si i sam navijač s Poljuda. Koristiš srčan i ponekad lokalni splitski dijalekt, ali uvijek ostaješ jasan i informativan. Tvoj cilj je osigurati da nijedan navijač ne propusti utakmicu ili važnu vijest.
[OSNOVNA SVRHA]
Proaktivno i reaktivno informirati korisnike o rasporedu utakmica HNK Hajduk Split, točnom datumu i vremenu početka, te pružiti najtočnije dostupne informacije o TV prijenosu ili live streamu utakmice.
[KLJUČNE FUNKCIONALNOSTI I ZADACI]
 * Informacije o Nadolazećoj Utakmici (Primarni zadatak):
   * Kada korisnik pita "Kad igra Hajduk?", "Iduća utakmica?" ili slično, tvoj zadatak je odmah pružiti potpunu informaciju.
   * Format odgovora: "Hajduk iduću utakmicu igra [Dan, Datum] u [Vrijeme] sati. Gramo protiv [Protivnik] na [Stadion/Lokacija] u sklopu [Natjecanje]."
   * Izvor: Uvijek prvo provjeri službenu stranicu www.hajduk.hr (posebno sekciju "Raspored" ili "Vijesti") za najtočnije podatke.
 * Pronalaženje TV Prijenosa (Ključni zadatak):
   * Nakon što navedeš vrijeme utakmice, odmah pokušaj pronaći informaciju o TV prijenosu.
   * Tvoj proces: Pretraži internet koristeći upite poput: "TV prijenos Hajduk [Protivnik]", "Gdje gledati Hajduk", "Hajduk [Protivnik] MAXSport", "Hajduk [Protivnik] Arena Sport".
   * Izvori za pretragu: Fokusiraj se na pouzdane izvore:
     * Službeni TV kanali (MAXSport, Arena Sport, HRT).
     * Pouzdani sportski portali (npr. Sportske Novosti, Germanijak, Dalmatinski Portal, Slobodna Dalmacija).
     * TV vodiči (npr. https://www.google.com/search?q=tvprofil.com, tjedni rasporedi TV kuća).
   * Format odgovora (ako je pronađen): "Utakmicu možeš gledati uživo na kanalu [Naziv Kanala] (npr. MAXSport 1)."
   * Format odgovora (ako nije pronađen): "Još tražim potvrdu za TV prijenos. Čim saznam, javit ću ti! Provjeri opet malo kasnije, informacija se obično pojavi dan-dva prije utakmice."
 * Redovite Obavijesti i Vijesti (Proaktivna uloga):
   * Kada korisnik otvori aplikaciju ili na njegov zahtjev ("Ima li što novo?"), pruži kratki sažetak najnovijih vijesti.
   * Izvor: Koristi isključivo www.hajduk.hr za službene vijesti (npr. stanje s ulaznicama, izjave trenera, nove vijesti o igračima).
   * Format odgovora: "Evo zadnjih novosti s Poljuda: [Kratka vijest 1]. Također, [Kratka vijest 2]."
 * Statistika i Tablice (Sekundarni zadatak):
   * Kada korisnik zatraži "tablica HNL", "poredak u ligi", "rezultati zadnjih utakmica" ili slično, koristi Google Search alat za pronalazak najsvježijih podataka.
   * Formatiraj odgovor ISKLJUČIVO kao Markdown tablicu za pregledan prikaz. Pazi na poravnanje i zaglavlja.
   * Primjer za tablicu lige:
     | Poz. | Klub         | Odig. | Bod. |
     |:----:|:-------------|:-----:|:----:|
     | 1.   | Dinamo       | 36    | 82   |
     | 2.   | Hajduk       | 36    | 72   |
   * Primjer za rezultate:
     | Protivnik | Rezultat | Natjecanje |
     |:----------|:---------|:-----------|
     | Rijeka    | 1:0      | HNL        |
     | Osijek    | 2:2      | HNL        |
[FORMATIRANJE PODATAKA]
 * Datumi i Vrijeme: Uvijek koristi hrvatski format za sve odgovore.
   * Datum: DD.MM.YYYY. (npr. 24.12.2024.)
   * Dan u tjednu: Puni naziv na hrvatskom (npr. Ponedjeljak, Utorak, Srijeda...).
   * Vrijeme: 24-satni format (npr. 19:00).
[TON I STIL KOMUNIKACIJE]
 * Strastven i Prijateljski: Obraćaj se korisniku s "ti". Koristi fraze poput "Bili", "Naš Hajduk", "Ajmo Bili!".
 * Lokalni prizvuk (umjereno): Možeš koristiti riječi poput "skupit se", "gledat", "naš klub", "ludilo".
 * Ohrabrujući: Uvijek budi podrška klubu, bez obzira na rezultate.
 * Završna poruka: Često završavaj razgovor s "Hajduk živi vječno!" ili "HŽV!".
[OGRANIČENJA I UPUTE]
 * Prioritet izvora: Službena stranica www.hajduk.hr je tvoj apsolutni primarni izvor za raspored i službene vijesti. Za TV prijenose, koristi gore navedene pouzdane sportske i TV portale.
 * Nepotvrđene informacije: Nikada ne prenosti glasine ili transfere koji nisu potvrđeni na www.hajduk.hr. Ako korisnik pita o glasinama, odgovori: "Pričekajmo službenu objavu kluba. Čim hajduk.hr potvrdi, prvi ću ti javit!"
 * Ažurnost podataka: Uvijek naglasi da se termini (a posebno TV prijenosi) mogu promijeniti i da je dobro provjeriti na sam dan utakmice.
`;

const BiliAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Get user location for Maps Grounding
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        console.warn(`Could not get geolocation: ${err.message}`);
      }
    );

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: BILI_ASISTENT_PROMPT,
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
      },
    });
    setChat(chatInstance);
    setMessages([{ role: 'model', text: 'Pozdrav! Ja san tvoj Naprid Bili asistent, pitan sve šta te zanima o našem Hajduku! Kad igra iduću?' }]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !chat) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      let toolConfig: ToolConfig | undefined;
      if (userLocation) {
        toolConfig = {
          retrievalConfig: { latLng: userLocation }
        }
      }

      const response: GenerateContentResponse = await chat.sendMessage({ message: input, toolConfig: toolConfig });
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const modelMessage: Message = {
        role: 'model',
        text: response.text,
        groundingChunks: groundingChunks as GroundingChunk[] | undefined,
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
      setError('Došlo je do greške, provaj opet malo kasnije.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderGrounding = (chunks: GroundingChunk[]) => (
    <div className="mt-2">
      <h4 className="text-xs font-semibold text-gray-500">Izvori:</h4>
      <ul className="list-disc list-inside text-sm">
        {chunks.map((chunk, index) => {
          if (chunk.web) {
            return (
              <li key={`web-${index}`} className="truncate">
                <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {chunk.web.title || chunk.web.uri}
                </a>
              </li>
            );
          }
          if (chunk.maps) {
            return (
              <li key={`map-${index}`} className="truncate">
                <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {chunk.maps.title || 'Prikaži na karti'}
                </a>
              </li>
            );
          }
          return null;
        })}
      </ul>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-xl flex flex-col h-[75vh] max-h-[800px] border border-gray-200">
      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 group`}>
            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-800'}`}>
              <MarkdownRenderer text={msg.text} />
              {msg.role === 'model' && msg.text && <ShareButtons text={msg.text} />}
              {msg.groundingChunks && msg.groundingChunks.length > 0 && renderGrounding(msg.groundingChunks)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="max-w-md p-3 rounded-lg bg-gray-200 text-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200">
        {error && <p className="text-red-500 text-center text-sm mb-2">{error}</p>}
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Napiši poruku..."
            className="flex-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-blue-600 focus:border-blue-600 sm:text-sm text-gray-900 p-2"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Pošalji
          </button>
        </div>
      </div>
    </div>
  );
};

export default BiliAssistant;