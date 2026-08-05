import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export interface FaqItem {
  q: string;
  a: string;
}

export function ToolFaq({ items }: { items: FaqItem[] }) {
  return (
    <Card className="py-6">
      <CardHeader>
        {/* A real heading (not CardTitle's <div>) — this section sits
            directly under the page's <h1>, and each accordion question
            below renders as an <h3> (Radix's Accordion.Header default), so
            this needs to be an <h2> to keep the outline sequential. */}
        <h2 className="font-semibold leading-none tracking-tight">Frequently asked questions</h2>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          {items.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
