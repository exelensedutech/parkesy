import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import PedalBikeIcon from "@mui/icons-material/PedalBike";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { VehicleTypeName } from "@/lib/types";

export default function VehicleIcon({ name }: { name: VehicleTypeName }) {
  switch (name) {
    case "Bike":
      return <TwoWheelerIcon />;
    case "Cycle":
      return <PedalBikeIcon />;
    case "Car":
      return <DirectionsCarIcon />;
  }
}
