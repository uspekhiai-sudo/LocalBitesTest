
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating: number;
  user_ratings_total: number;
  photo_url: string;
  location: Coordinates;
}



export interface Restaurant {
  name: string;
  cuisine: string;
  description: string;
}




export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Language {
  code: string;
  name: string;
}


export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Restaurant {
  id: string; // Google Place ID
  name: string;
  address: string;
  rating: number; // e.g., 4.5
  user_ratings_total: number; // number of reviews
  photo_url: string; // URL for a place photo
  location: Coordinates;
    // Add other fields you might need from Places API
  }


  export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating: number;
  user_ratings_total: number;
  photo_url: string;
  location: Coordinates;
}
