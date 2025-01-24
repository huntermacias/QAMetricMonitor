export function mapWorkItemType(type: string) {
  switch (type.toLowerCase()) {
    case "user story":
      return "userstory";
    case "bug":
      return "bug";
    case "task":
      return "task";
    case "feature":
      return "feature";
    case "epic":
      return "epic";
    default:
      return undefined;
  }
}

export function mapState(state: string) {
  switch (state.toLowerCase()) {
    case "in progress":
      return "inprogress";
    case "planned":
      return "planned";
    case "released":
      return "released";
    case "committed":
      return "committed";
    case "closed":
      return "closed";
    default:
      return undefined;
  }
}
  