import { Redirect, type Href } from "expo-router";

export default function AddPropertyTab() {
  return <Redirect href={"/landlord/properties/create/basics" as Href} />;
}
