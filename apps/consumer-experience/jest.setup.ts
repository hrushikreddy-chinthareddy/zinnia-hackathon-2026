import '@testing-library/jest-dom';

import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
// TODO MG: fix casting to any
global.TextDecoder = TextDecoder as any;
