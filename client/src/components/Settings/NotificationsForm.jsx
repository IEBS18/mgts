"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"

const notificationsFormSchema = z.object({
  marketUpdates: z.boolean().default(false).optional(),
  newDrugs: z.boolean().default(false).optional(),
  competitorActivity: z.boolean().default(false).optional(),
  regulatoryChanges: z.boolean().default(false).optional(),
  priceChanges: z.boolean().default(false).optional(),
  emailDigest: z.boolean().default(false).optional(),
})

export function NotificationsForm() {
  const form = useForm({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      marketUpdates: true,
      newDrugs: true,
      competitorActivity: true,
      regulatoryChanges: false,
      priceChanges: false,
      emailDigest: false,
    },
  })

  function onSubmit(data) {
    console.log(data)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <h3 className="mb-4 text-lg font-medium">Email Notifications</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="marketUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Market Updates</FormLabel>
                        <FormDescription>Receive notifications about market trends and updates.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newDrugs"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>New Drug Releases</FormLabel>
                        <FormDescription>Get notified when new drugs are released or approved.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="competitorActivity"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Competitor Activity</FormLabel>
                        <FormDescription>Receive alerts about competitor activities and changes.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="regulatoryChanges"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Regulatory Changes</FormLabel>
                        <FormDescription>
                          Get updates on regulatory changes and compliance requirements.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceChanges"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Price Changes</FormLabel>
                        <FormDescription>Receive notifications about price changes in the market.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailDigest"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Weekly Email Digest</FormLabel>
                        <FormDescription>Receive a weekly summary of all important updates.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit">Save preferences</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

