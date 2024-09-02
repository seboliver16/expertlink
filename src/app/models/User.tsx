import Project from "./project";

class User {
  id: string;
  name: string;
  email: string;
  type: string;
  linkedinId: string;
  projects: Map<string, Project>;
  credits: number;
  status: Map<string, string>;
  projectsCompleted: number;
  lifetimeIncome: number;

  constructor(
    id: string,
    name: string,
    email: string,
    type: string,
    linkedinId: string,
    projects: Map<string, Project> = new Map(),
    credits: number = 0,
    status: Map<string, string> = new Map(),
    projectsCompleted: number = 0,
    lifetimeIncome: number = 0
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.type = type;
    this.linkedinId = linkedinId;
    this.projects = projects;
    this.credits = credits;
    this.status = status;
    this.projectsCompleted = projectsCompleted;
    this.lifetimeIncome = lifetimeIncome;
  }

  // Method to add a project to the user's list of projects
  addProject(project: Project) {
    this.projects.set(project.id, project);
  }

  // Method to update the status of a project by its ID
  updateProjectStatus(seekerId: string, projectId: string, newExpertStatus: string, newSeekerStatus: string) {
    const project = this.projects.get(projectId);
    if (project) {
      project.updateStatus(seekerId, newExpertStatus, newSeekerStatus);
    }
  }

  // Method to use a credit
  useCredit() {
    if (this.credits > 0) {
      this.credits -= 1;
    } else {
      throw new Error("Not enough credits");
    }
  }

  // Method to add credits
  addCredit(amount: number) {
    this.credits += amount;
  }
}

export default User;
