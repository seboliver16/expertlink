class Project {
  id: string;
  title: string;
  description: string;
  questions: string[];
  expertStatus: string;
  seekerStatus: string;
  askingPrice?: number;
  availability?: string[];
  lastUpdated: string;
  categories: string[];

  constructor(
    id: string,
    title: string,
    description: string,
    questions: string[],
    expertStatus: string,
    seekerStatus: string,
    categories: string[] = ["General"],
    askingPrice?: number,
    availability?: string[],
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.questions = questions;
    this.expertStatus = expertStatus;
    this.seekerStatus = seekerStatus;
    this.categories = categories;
    this.askingPrice = askingPrice;
    this.availability = availability;
    this.lastUpdated = new Date().toISOString();
  }

  updateStatus(newExpertStatus: string, newSeekerStatus: string) {
    this.expertStatus = newExpertStatus;
    this.seekerStatus = newSeekerStatus;
    this.lastUpdated = new Date().toISOString();
  }

  setAskingPrice(price: number) {
    this.askingPrice = price;
  }

  setAvailability(availability: string[]) {
    this.availability = availability;
  }

  updateCategories(newCategories: string[]) {
    this.categories = newCategories;
  }
}

export default Project;
