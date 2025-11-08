import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  // Check if the text contains a markdown table structure
  const isTable = text.includes('|') && text.includes('---');

  if (!isTable) {
    // If not a table, render as plain text preserving whitespace and newlines
    return <p className="whitespace-pre-wrap">{text}</p>;
  }

  const lines = text.trim().split('\n');
  
  // Basic validation for table structure
  if (lines.length < 2 || !lines[1].includes('---')) {
    return <p className="whitespace-pre-wrap">{text}</p>;
  }

  const headerLine = lines[0];
  const bodyLines = lines.slice(2);

  const headers = headerLine.split('|').map(h => h.trim()).filter(Boolean);
  const rows = bodyLines.map(line => line.split('|').map(cell => cell.trim()).filter(Boolean));

  // If parsing results in no headers or no rows, it's likely not a valid table
  if (headers.length === 0 || rows.some(row => row.length !== headers.length)) {
      return <p className="whitespace-pre-wrap">{text}</p>;
  }

  return (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-sm text-left text-gray-800">
        <thead className="bg-gray-300 text-gray-900">
          <tr>
            {headers.map((header, index) => (
              <th key={index} scope="col" className="px-4 py-2 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-300 hover:bg-gray-100">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarkdownRenderer;
