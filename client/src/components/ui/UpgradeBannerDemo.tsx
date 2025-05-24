import React, { useState } from 'react';
import { UpgradeBanner } from './UpgradeBanner';
import { CompactUpgradeBanner } from './CompactUpgradeBanner';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Settings, RotateCcw } from 'lucide-react';

export function UpgradeBannerDemo() {
  const [refreshKey, setRefreshKey] = useState(0);

  const resetBanners = () => {
    // Clear localStorage and force re-render
    localStorage.removeItem('upgrade-banner-dismissed');
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Upgrade Banner Demo
          </CardTitle>
          <Button onClick={resetBanners} variant="outline" size="sm" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset Banners
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Full Upgrade Banner</h4>
          <UpgradeBanner key={`full-${refreshKey}`} persistDismissal={false} />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Compact Upgrade Banner</h4>
          <CompactUpgradeBanner key={`compact-${refreshKey}`} />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Persistent Dismissal (saves to localStorage)</h4>
          <UpgradeBanner key={`persistent-${refreshKey}`} persistDismissal={true} />
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Banners only show when user is on trial</p>
          <p>• Color changes to orange when ≤3 days left</p>
          <p>• Dismissal can be temporary (session) or persistent (localStorage)</p>
          <p>• Links direct to the subscription page</p>
        </div>
      </CardContent>
    </Card>
  );
} 