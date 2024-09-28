import axios from "axios";

export async function getUsers(region, errorCount, seed, page) {
  return await axios.get(`http://https://task-5-4uqz.onrender.com/generate`, {
    params: { region, errorCount, seed, page },
  });
}
