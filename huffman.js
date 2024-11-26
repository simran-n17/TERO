class Node {
    constructor(char, freq, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
    }
}

function buildFrequencyMap(text) {
    const freqMap = {};
    for (const char of text) {
        freqMap[char] = (freqMap[char] || 0) + 1;
    }
    return freqMap;
}

function buildHuffmanTree(freqMap) {
    const nodes = Object.entries(freqMap).map(([char, freq]) => new Node(char, freq));
    while (nodes.length > 1) {
        nodes.sort((a, b) => a.freq - b.freq);
        const left = nodes.shift();
        const right = nodes.shift();
        const newNode = new Node(null, left.freq + right.freq, left, right);
        nodes.push(newNode);
    }
    return nodes[0];
}

function generateHuffmanCodes(node, code = '', codeMap = {}) {
    if (!node) return;
    if (node.char !== null) {
        codeMap[node.char] = code;
    }
    generateHuffmanCodes(node.left, code + '0', codeMap);
    generateHuffmanCodes(node.right, code + '1', codeMap);
    return codeMap;
}

function huffmanCompress(text) {
    // Log the input text to ensure it's not empty
    console.log('Input Text:', text);
    
    const freqMap = buildFrequencyMap(text);
    console.log('Frequency Map:', freqMap); // Log frequency map for debugging

    const huffmanTree = buildHuffmanTree(freqMap);
    const huffmanCodes = generateHuffmanCodes(huffmanTree);

    // Convert text to Huffman encoded binary string
    const encodedData = text.split('').map(char => huffmanCodes[char]).join('');
    console.log('Encoded Data:', encodedData); // Log the encoded data for debugging

    // Check if the encoded data is empty
    if (!encodedData) {
        console.error('Encoded data is empty!');
        return Buffer.alloc(0); // Return an empty buffer
    }

    // Prepare a buffer to hold the binary data
    const bufferLength = Math.ceil(encodedData.length / 8);
    const buffer = Buffer.alloc(bufferLength);

    for (let i = 0; i < encodedData.length; i += 8) {
        const byte = encodedData.slice(i, i + 8).padEnd(8, '0'); // Ensure full byte
        buffer[i / 8] = parseInt(byte, 2);
    }

    console.log('Compressed buffer length:', buffer.length); // Log the buffer length
    return buffer; // Return the compressed buffer directly
}

module.exports = { huffmanCompress };
