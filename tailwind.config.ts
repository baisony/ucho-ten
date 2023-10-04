import type { Config } from 'tailwindcss'
import { nextui } from '@nextui-org/react';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    fontFamily: {
      body: ['"noto color emoji"',
             '"segoe ui emoji"',
             '"android emoji"',
             'emojisymbols',
             '"emojione mozilla"',
             '"twemoji mozilla"',
             '"segoe ui symbol"']
    }
  },
  darkMode: 'class',
  plugins: [nextui()],
}
export default config
