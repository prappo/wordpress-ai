import { createBrowserClient } from '@supabase/ssr';

export interface ProjectUsage {
  currentProjects: number;
  projectLimit: number;
  remainingProjects: number;
}

export async function getProjectUsageClient(): Promise<ProjectUsage> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        currentProjects: 0,
        projectLimit: Infinity,
        remainingProjects: Infinity,
      };
    }

    // Get customer ID
    const { data: customers, error: customerError } = await supabase
      .from("customers")
      .select("customer_id")
      .eq("email", user.email);

    if (customerError || !customers || customers.length === 0) {
      return {
        currentProjects: 0,
        projectLimit: Infinity,
        remainingProjects: Infinity,
      };
    }

    // Get project count
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id", { count: "exact" })
      .eq("customer_id", customers[0].customer_id);

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return {
        currentProjects: 0,
        projectLimit: Infinity,
        remainingProjects: Infinity,
      };
    }

    const currentProjects = projects?.length || 0;

    return {
      currentProjects,
      projectLimit: Infinity,
      remainingProjects: Infinity,
    };
  } catch (error) {
    console.error("Error getting project usage:", error);
    return {
      currentProjects: 0,
      projectLimit: Infinity,
      remainingProjects: Infinity,
    };
  }
}
