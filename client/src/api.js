import axios from "axios";

export async function getUsers(region, errorCount, seed, page) {
  return await axios.get(`http://localhost:8080/generate`, {
    params: { region, errorCount, seed, page },
  });
}
