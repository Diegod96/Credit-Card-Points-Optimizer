import '@testing-library/jest-dom';

// Polyfill Web API Response for Next.js API routes
global.Response = class Response {
  body: any;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;

  constructor(body?: any, init?: ResponseInit) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || '';
    this.headers = new Headers(init?.headers);
    this.url = '';
  }

  static json(data: any, init?: ResponseInit): Response {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...init?.headers,
      },
    });
  }

  async json(): Promise<any> {
    return JSON.parse(this.body);
  }

  async text(): Promise<string> {
    return String(this.body);
  }
} as any;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: () => new Map(),
}));
