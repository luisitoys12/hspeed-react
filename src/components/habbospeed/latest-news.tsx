'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, LoaderCircle } from 'lucide-react';
import { getLatestNews } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LatestNews() {
  const [news, setNews] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchNews = async () => {
    setIsLoading(true);
    setError(null);
    setNews(null);
    try {
      const result = await getLatestNews({ stationName: 'Habbospeed Radio' });
      if(result.newsSummary) {
        setNews(result.newsSummary);
      } else {
        setError('Could not fetch the latest news. Please try again.');
      }
    } catch (e) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Sparkles className="text-primary" />
          Station News AI
        </CardTitle>
        <CardDescription>
          Click the button to get the latest AI-generated news summary about Habbospeed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleFetchNews} disabled={isLoading}>
          {isLoading ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Fetching...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Fetch Latest News
            </>
          )}
        </Button>
        {news && (
          <Alert>
            <AlertTitle className="font-headline">Latest Update</AlertTitle>
            <AlertDescription>{news}</AlertDescription>
          </Alert>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
