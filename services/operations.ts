
import { Operation } from '../types';
import CryptoJS from 'crypto-js';

export const OPERATIONS: Operation[] = [
  {
    id: 'base64-decode',
    name: 'Base64 Decode',
    description: 'Decodes a Base64 string back to plain text.',
    category: 'Encoding',
    run: (input) => {
      try {
        return CryptoJS.enc.Base64.parse(input).toString(CryptoJS.enc.Utf8);
      } catch (e) {
        return "Error: Invalid Base64 input";
      }
    }
  },
  {
    id: 'base64-encode',
    name: 'Base64 Encode',
    description: 'Encodes plain text into Base64 format.',
    category: 'Encoding',
    run: (input) => {
      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input));
    }
  },
  {
    id: 'hex-decode',
    name: 'Hex Decode',
    description: 'Converts hexadecimal values into plain text.',
    category: 'Encoding',
    run: (input) => {
      try {
        return CryptoJS.enc.Hex.parse(input.replace(/\s/g, '')).toString(CryptoJS.enc.Utf8);
      } catch (e) {
        return "Error: Invalid Hex input";
      }
    }
  },
  {
    id: 'hex-encode',
    name: 'Hex Encode',
    description: 'Converts plain text into hexadecimal format.',
    category: 'Encoding',
    run: (input) => {
      return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(input));
    }
  },
  {
    id: 'md5',
    name: 'MD5 Hash',
    description: 'Computes the MD5 message-digest of the input.',
    category: 'Hashing',
    run: (input) => CryptoJS.MD5(input).toString()
  },
  {
    id: 'sha1',
    name: 'SHA-1 Hash',
    description: 'Computes the SHA-1 hash of the input.',
    category: 'Hashing',
    run: (input) => CryptoJS.SHA1(input).toString()
  },
  {
    id: 'sha256',
    name: 'SHA-256 Hash',
    description: 'Computes the SHA-256 hash of the input.',
    category: 'Hashing',
    run: (input) => CryptoJS.SHA256(input).toString()
  },
  {
    id: 'sha512',
    name: 'SHA-512 Hash',
    description: 'Computes the SHA-512 hash of the input.',
    category: 'Hashing',
    run: (input) => CryptoJS.SHA512(input).toString()
  },
  {
    id: 'rot13',
    name: 'ROT13',
    description: 'Applies ROT13 substitution cipher.',
    category: 'Encryption',
    run: (input) => {
      return input.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
      });
    }
  },
  {
    id: 'url-encode',
    name: 'URL Encode',
    description: 'Percent-encodes special characters in a URL.',
    category: 'Encoding',
    run: (input) => encodeURIComponent(input)
  },
  {
    id: 'url-decode',
    name: 'URL Decode',
    description: 'Decodes percent-encoded characters.',
    category: 'Encoding',
    run: (input) => decodeURIComponent(input)
  },
  {
    id: 'json-prettify',
    name: 'JSON Prettify',
    description: 'Formats a JSON string with indentation.',
    category: 'Data Format',
    run: (input) => {
      try {
        return JSON.stringify(JSON.parse(input), null, 2);
      } catch (e) {
        return "Error: Invalid JSON";
      }
    }
  },
  {
    id: 'reverse',
    name: 'Reverse String',
    description: 'Reverses the order of characters.',
    category: 'Utils',
    run: (input) => input.split('').reverse().join('')
  },
  {
    id: 'to-uppercase',
    name: 'To Uppercase',
    description: 'Converts all characters to uppercase.',
    category: 'Utils',
    run: (input) => input.toUpperCase()
  },
  {
    id: 'to-lowercase',
    name: 'To Lowercase',
    description: 'Converts all characters to lowercase.',
    category: 'Utils',
    run: (input) => input.toLowerCase()
  }
];

export const getOperationById = (id: string) => OPERATIONS.find(op => op.id === id);
