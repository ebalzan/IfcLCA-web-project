import { useMutation } from "@tanstack/react-query";
import { ProjectService } from "@/lib/services/projects/project-service";
import { useQueryClient } from "@tanstack/react-query";
import { Queries } from "@/queries";
import { toast } from "@/hooks/use-toast";

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => ProjectService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Queries.GET_PROJECTS] });

      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      });
    },
  });
}