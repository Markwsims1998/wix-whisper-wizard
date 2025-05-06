
export interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMine: boolean;
  image?: string | { url: string; name: string };
}
