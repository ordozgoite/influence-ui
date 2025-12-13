import "./globals.css";
import { WebSocketProvider } from "./WebSocketContext";

export const metadata = {
  title: "AroundYou Game",
  description: "Real-time multiplayer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </body>
    </html>
  );
}