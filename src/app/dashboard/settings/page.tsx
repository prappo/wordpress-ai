'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function loadApiKey() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: customers, error: customerError } = await supabase
          .from('customers')
          .select('open_ai_api_key')
          .eq('email', user.email);

        if (customerError) throw customerError;
        if (customers && customers.length > 0 && customers[0].open_ai_api_key) {
          setApiKey(customers[0].open_ai_api_key);
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    }

    loadApiKey();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // First get the customer record using the user's email
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('email', user.email)
        .single();

      if (customerError) throw customerError;
      if (!customer) throw new Error('Customer record not found');

      // Update the API key for the found customer
      const { error } = await supabase
        .from('customers')
        .update({ open_ai_api_key: apiKey })
        .eq('customer_id', customer.customer_id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'OpenAI API key updated successfully',
      });
    } catch (error) {
      console.error('Error updating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to update OpenAI API key',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle="Settings" />
      <div className="grid gap-6">
        <Card className="bg-background/50 backdrop-blur-[24px] border-border p-6">
          <CardHeader className="p-0 space-y-0">
            <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
              <span className="text-xl font-medium">OpenAI API Key</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="apiKey" className="text-base font-medium text-foreground">
                    API Key
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Enter your OpenAI API key to enable AI-powered features
                  </p>
                </div>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="h-11 text-base"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading} variant="secondary" className="w-full md:w-auto">
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
