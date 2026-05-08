import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OFFER_FLOW_STEPS, type OfferFlowStep } from "@/lib/offer-flow";

type FlowDictionary = {
  title: string;
  complete: string;
  current: string;
  locked: string;
  nextStep: string;
  back: string;
  steps: Record<OfferFlowStep, string>;
};

const STEP_PATH: Record<OfferFlowStep, string> = {
  overview: "overview",
  "material-prices": "material-prices",
  "scopes-lines": "scopes-lines",
  calculation: "calculation",
  "review-export": "calculation",
};

function getStepEnabled(step: OfferFlowStep, completed: Record<OfferFlowStep, boolean>) {
  const index = OFFER_FLOW_STEPS.indexOf(step);
  if (index <= 0) return true;
  return OFFER_FLOW_STEPS.slice(0, index).every((prior) => completed[prior]);
}

export function OfferFlowProgress({
  offerId,
  currentStep,
  completed,
  dictionary,
}: {
  offerId: string;
  currentStep: OfferFlowStep;
  completed: Record<OfferFlowStep, boolean>;
  dictionary: FlowDictionary;
}) {
  const stepIndex = OFFER_FLOW_STEPS.indexOf(currentStep);
  const prevStep = stepIndex > 0 ? OFFER_FLOW_STEPS[stepIndex - 1] : null;
  const nextStep = stepIndex < OFFER_FLOW_STEPS.length - 1 ? OFFER_FLOW_STEPS[stepIndex + 1] : null;
  const nextStepEnabled = nextStep ? getStepEnabled(nextStep, completed) : false;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{dictionary.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="space-y-2">
          {OFFER_FLOW_STEPS.map((step, index) => {
            const enabled = getStepEnabled(step, completed);
            const isCurrent = step === currentStep;
            const status = completed[step]
              ? dictionary.complete
              : isCurrent
                ? dictionary.current
                : enabled
                  ? dictionary.current
                  : dictionary.locked;

            return (
              <li key={step} className="flex items-center justify-between rounded-xl border bg-muted/30 p-3">
                <div className="text-sm">
                  {index + 1}. {dictionary.steps[step]}
                </div>
                <div className="text-xs text-muted-foreground">{status}</div>
              </li>
            );
          })}
        </ol>
        <div className="flex gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            disabled={!prevStep}
            render={<Link href={prevStep ? `/offers/${offerId}/${STEP_PATH[prevStep]}` : "#"} />}
          >
            {dictionary.back}
          </Button>
          <Button
            nativeButton={false}
            disabled={!nextStep || !nextStepEnabled}
            render={<Link href={nextStep ? `/offers/${offerId}/${STEP_PATH[nextStep]}` : "#"} />}
          >
            {dictionary.nextStep}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
