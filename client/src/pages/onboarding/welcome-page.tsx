import { Button } from "@/components/ui/button";
import { ChartLine } from "lucide-react";

interface WelcomePageProps {
  goNext: () => void;
}

export default function WelcomePage({ goNext }: WelcomePageProps) {
  return (
    <div className="space-y-6 max-w-xl mx-auto text-center">
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
          <ChartLine className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Welcome to RepuRadar</h1>
        <p className="text-lg text-slate-600 mt-2">
          Your 14-day trial of RepuRadar Pro has started!
        </p>
      </div>

      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 my-8">
        <h2 className="text-xl font-medium text-slate-800 mb-4">What's included in your trial?</h2>
        <ul className="space-y-3 text-left">
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 text-xs font-bold mr-3 mt-0.5">✓</span>
            <div>
              <span className="font-medium">AI-powered review responses</span>
              <p className="text-sm text-slate-600">Automatically generate professional responses to customer reviews</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 text-xs font-bold mr-3 mt-0.5">✓</span>
            <div>
              <span className="font-medium">Multi-platform monitoring</span>
              <p className="text-sm text-slate-600">Track reviews across Google, Yelp, Facebook, and more in one place</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 text-xs font-bold mr-3 mt-0.5">✓</span>
            <div>
              <span className="font-medium">Review request campaigns</span>
              <p className="text-sm text-slate-600">Send personalized review requests to boost your online presence</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 text-xs font-bold mr-3 mt-0.5">✓</span>
            <div>
              <span className="font-medium">Performance analytics</span>
              <p className="text-sm text-slate-600">Track sentiment trends and identify improvement opportunities</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <p className="text-slate-600">
          Let's set up your account to get the most out of your trial. This will only take about 5 minutes.
        </p>
        <Button size="lg" onClick={goNext}>
          Begin Setup
        </Button>
      </div>
    </div>
  );
}