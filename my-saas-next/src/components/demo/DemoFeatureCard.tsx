'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Code2 } from 'lucide-react';

interface DemoFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  demoComponent: React.ReactNode;
  codeSnippet?: string;
  gradient?: string;
}

export function DemoFeatureCard({
  title,
  description,
  icon: Icon,
  demoComponent,
  codeSnippet,
  gradient = 'from-blue-500 to-purple-600',
}: DemoFeatureCardProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Gradient border effect */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br',
          gradient
        )}
      />

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg bg-gradient-to-br', gradient)}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          {codeSnippet && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              className="shrink-0"
            >
              <Code2 className="h-4 w-4 mr-1" />
              {showCode ? 'Hide' : 'Code'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {showCode && codeSnippet ? (
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{codeSnippet}</code>
            </pre>
            <div className="absolute top-2 right-2">
              <div className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-1 rounded">
                TypeScript
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-[200px]">{demoComponent}</div>
        )}
      </CardContent>
    </Card>
  );
}
