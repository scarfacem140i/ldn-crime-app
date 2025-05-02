import { crimeCategories } from "@/lib/types/filters";
import {
  AlertTriangle,
  Bike,
  Car,
  Flame,
  HelpCircle,
  Home,
  MapPin,
  Pill,
  Shield,
  ShoppingBag,
  Store,
  Swords,
  User2,
  UserX2
} from "lucide-react";
import { ComponentPropsWithoutRef } from "react";

interface CrimeIconProps extends ComponentPropsWithoutRef<"svg"> {
  category: string;
  className?: string;
}

export function CrimeIcon({ category, className }: CrimeIconProps) {
  const getIconByCategory = () => {
    // Use lowercase for case-insensitive comparison
    const lowerCategory = category.toLowerCase();

    // Check if the category is in our defined list
    if (
      !crimeCategories.map((c) => c.toLowerCase()).includes(lowerCategory) &&
      lowerCategory !== "all-crime"
    ) {
      return <HelpCircle className={className} />;
    }

    switch (lowerCategory) {
      case "all-crime":
        return <MapPin className={className} />;
      case "anti-social-behaviour":
        return <UserX2 className={className} />;
      case "bicycle-theft":
        return <Bike className={className} />;
      case "burglary":
        return <Home className={className} />;
      case "criminal-damage-arson":
        return <Flame className={className} />;
      case "drugs":
        return <Pill className={className} />;
      case "other-theft":
        return <ShoppingBag className={className} />;
      case "possession-of-weapons":
        return <Swords className={className} />;
      case "public-order":
        return <Shield className={className} />;
      case "robbery":
        return <AlertTriangle className={className} />;
      case "shoplifting":
        return <Store className={className} />;
      case "theft-from-the-person":
        return <User2 className={className} />;
      case "vehicle-crime":
        return <Car className={className} />;
      case "violent-crime":
        return <Swords className={className} />;
      case "other-crime":
        return <HelpCircle className={className} />;
      default:
        return <HelpCircle className={className} />;
    }
  };

  return getIconByCategory();
}
