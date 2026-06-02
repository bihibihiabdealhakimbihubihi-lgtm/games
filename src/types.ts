export interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  genre?: string;
  developer?: string;
  latestVersion?: string;
  updatedDate?: string;
  osVersion?: string;
  packageName?: string;
  features?: string[];
  screenshots?: string[];
  androidAction?: string;
  iosAction?: string;
}
