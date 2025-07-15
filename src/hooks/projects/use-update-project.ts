import { useMutation } from "@tanstack/react-query";
import { ProjectService } from "@/lib/services/projects/project-service";
import { UpdateProjectSchema } from "@/schemas/projects/updateProjectSchema";
import { useParams } from "next/navigation";
import { toast } from "../use-toast";

export function useUpdateProject() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  
  return useMutation({
    mutationFn: (project: UpdateProjectSchema) => ProjectService.updateProject(projectId, project),
    onSuccess: () => {
      toast({
        title: "Project updated",
        description: "Project has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    },
  });
}