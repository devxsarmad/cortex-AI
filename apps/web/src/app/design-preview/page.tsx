import type { Metadata } from "next";
import { DesignPreview } from "./preview";

export const metadata: Metadata = { title: "Design system preview · Cortex AI", description: "Cortex AI component and design token preview" };
export default function DesignPreviewPage() { return <DesignPreview />; }
