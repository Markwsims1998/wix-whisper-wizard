
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define a list of countries and their cities
const countryData = {
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Edinburgh", "Bristol", "Leeds", "Sheffield", "Newcastle"],
  "Canada": ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Quebec City", "Winnipeg", "Hamilton", "Halifax"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Hobart"],
  "Germany": ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen"],
  "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"],
  "Japan": ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kyoto", "Kawasaki", "Saitama"]
};

// Convert to alphabetical arrays for dropdown
const countries = Object.keys(countryData).sort();

interface LocationSelectorProps {
  value: string;
  onChange: (location: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ value, onChange }) => {
  // State for selected country and city
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);

  // Parse initial value (if any) in format "Country, City"
  useEffect(() => {
    if (value) {
      const parts = value.split(", ");
      if (parts.length === 2) {
        const country = parts[0];
        const city = parts[1];
        
        if (countries.includes(country)) {
          setSelectedCountry(country);
          setCities(countryData[country] || []);
          
          if (countryData[country]?.includes(city)) {
            setSelectedCity(city);
          }
        }
      }
    }
  }, [value]);

  // Handle country selection
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity("");
    setCities(countryData[country] || []);
    onChange(country); // Update with just the country until a city is selected
  };

  // Handle city selection
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    onChange(`${selectedCountry}, ${city}`); // Update with formatted "Country, City"
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select 
          value={selectedCountry} 
          onValueChange={handleCountryChange}
        >
          <SelectTrigger id="country">
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Select 
          value={selectedCity} 
          onValueChange={handleCityChange}
          disabled={!selectedCountry}
        >
          <SelectTrigger id="city">
            <SelectValue placeholder={!selectedCountry ? "Select a country first" : "Select a city"} />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LocationSelector;
