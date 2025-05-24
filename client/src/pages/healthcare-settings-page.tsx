import React from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HealthcareSettingsPage() {
  return (
    <SidebarLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Healthcare Settings</CardTitle>
            <CardDescription>Configure your healthcare-specific settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Healthcare settings page is being updated...</p>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}