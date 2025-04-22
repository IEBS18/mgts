// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Separator } from "@/components/ui/separator"
// import { AppearanceForm } from "@/components/settings/AppearanceForm"
// import { ProfileForm } from "@/components/settings/ProfileForm"
// import { NotificationsForm } from "@/components/settings/NotificationsForm"

// export default function SettingsPage() {
//   return (
//     <div className="container py-6">
//       <div className="space-y-6">
//         <div>
//           <h3 className="text-lg font-medium">Settings</h3>
//           <p className="text-sm text-muted-foreground">Manage your account settings and preferences.</p>
//         </div>
//         <Separator />
//         <Tabs defaultValue="profile" className="w-full">
//           <TabsList className="grid w-full max-w-md grid-cols-3">
//             <TabsTrigger value="profile">Profile</TabsTrigger>
//             <TabsTrigger value="appearance">Appearance</TabsTrigger>
//             <TabsTrigger value="notifications">Notifications</TabsTrigger>
//           </TabsList>
//           <TabsContent value="profile">
//             <ProfileForm />
//           </TabsContent>
//           <TabsContent value="appearance">
//             <AppearanceForm />
//           </TabsContent>
//           <TabsContent value="notifications">
//             <NotificationsForm />
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   )
// }


import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AppearanceForm } from "@/components/settings/AppearanceForm"
import { ProfileForm } from "@/components/settings/ProfileForm"
import { NotificationsForm } from "@/components/settings/NotificationsForm"

export default function SettingsPage() {
  const { tab } = useParams() // Retrieve the "tab" parameter from the URL
  const [activeTab, setActiveTab] = useState(tab || "profile") // Default to 'profile' if no tab in the URL

  useEffect(() => {
    // Whenever the tab parameter changes in the URL, update the active tab
    if (tab) {
      setActiveTab(tab)
    }
  }, [tab])

  return (
    <div className="container py-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Settings</h3>
          <p className="text-sm text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        <Separator />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceForm />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
