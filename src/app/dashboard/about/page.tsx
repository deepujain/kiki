
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Zap, Target, Mail, Linkedin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1.33331 1.33331L14.6666 14.6666M1.33331 14.6666L14.6666 1.33331L1.33331 14.6666Z" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)


export default function AboutPage() {
  const features = [
    {
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: "Smart Analytics",
      description: "Insights for better decision making",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Streamlined Operations",
      description: "Manage daily operations efficiently",
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Growth Focused",
      description: "Tools designed to scale your business",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/40 p-8 text-center">
          <div className="mx-auto mb-4">
            <img src="/images/1xAI.png" alt="1xAI Logo" className="h-16 w-16" />
          </div>
          <CardTitle className="text-3xl font-headline tracking-tight">
            1xAI
          </CardTitle>
          <p className="text-muted-foreground">AI-Powered Applications</p>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <p className="text-center text-lg text-muted-foreground">
            1xAI is the creator of Kiki 🦀 application, focused on intelligent
            analytics and actionable insights through AI-powered technologies.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <h3 className="font-semibold">Contact Us</h3>
            <div className="flex justify-center items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href="mailto:onexai.inc@gmail.com"
                className="text-primary hover:underline"
              >
                onexai.inc@gmail.com
              </a>
            </div>
            <div className="flex justify-center items-center gap-2">
              <Linkedin className="h-4 w-4 text-muted-foreground" />
              <Link
                href="https://www.linkedin.com/company/1xai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Connect on LinkedIn
              </Link>
            </div>
            <div className="flex justify-center items-center gap-2">
                <XIcon />
                <Link
                    href="https://x.com/onexai_inc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                >
                    Follow on X
                </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
