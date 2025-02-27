import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'

import { ColorSchemeScript, MantineProvider, mantineHtmlProps, MantineColorsTuple, createTheme } from '@mantine/core';
import { use } from 'react';

export const metadata = {
  title: 'Gráf feladat generátor',
  description: 'Generálj gráfelmélet feladatokat',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme='auto'>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}