'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, PlusCircle, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateProject } from '@/hooks/projects/use-project-operations'
import { CreateProjectSchema, createProjectSchema } from '@/schemas/projectSchema'

export default function ProjectsNewPage() {
  const router = useRouter()
  const { mutate: createProject, isLoading } = useCreateProject()

  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })
  const { handleSubmit } = form

  const breadcrumbItems = [
    { label: 'Projects', href: '/projects' },
    { label: 'New Project', href: undefined },
  ]

  // if (isLoading) {
  //   return (
  //     <div className="container mx-auto p-6 space-y-8">
  //       <Breadcrumbs items={breadcrumbItems} />
  //       <Card className="max-w-2xl mx-auto">
  //         <CardHeader>
  //           <CardTitle>Loading...</CardTitle>
  //         </CardHeader>
  //       </Card>
  //     </div>
  //   )
  // }

  // if (projects?.length >= 3) {
  //   return (
  //     <div className="container mx-auto p-6 space-y-8">
  //       <Breadcrumbs items={breadcrumbItems} />
  //       <Card className="max-w-2xl mx-auto">
  //         <CardHeader>
  //           <CardTitle>Project Limit Reached</CardTitle>
  //           <CardDescription>You currently have {projectCount} projects</CardDescription>
  //         </CardHeader>
  //         <CardContent className="space-y-4">
  //           <div className="text-muted-foreground space-y-4">
  //             <p>
  //               Databases cost real money 💸 and while we would like to offer the most to all users
  //               in an effort to push sustainable construction, IfcLCA is still fully bootstrapped.
  //             </p>
  //             <p>We have plans for many more powerful features once we&apos;re out of BETA! 🚀</p>
  //             <p>
  //               Stay tuned and get in touch if you really need more projects today (or let&apos;s
  //               maybe say tomorrow 😉)
  //             </p>
  //           </div>
  //         </CardContent>
  //         <CardFooter>
  //           <Button variant="outline" asChild>
  //             <Link href="/projects">
  //               <ArrowLeft className="mr-2 h-4 w-4" />
  //               Back to Projects
  //             </Link>
  //           </Button>
  //         </CardFooter>
  //       </Card>
  //     </div>
  //   )
  // }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Breadcrumbs items={breadcrumbItems} />
      <Card className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={handleSubmit(data => createProject(data))}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <PlusCircle className="h-6 w-6 text-muted-foreground" />
                New Project
              </CardTitle>
              <CardDescription>Create a new project to start your LCA analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter project description (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={router.back} disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Project
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
