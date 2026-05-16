const initialGyms = [
  {
    id: 1,
    name: "Nordic Fitness",
    location: "Gothenburg",
    reviews: []
  },
  {
    id: 2,
    name: "Iron Paradise",
    location: "Stockholm",
    reviews: []
  }
];

export const gyms = [...initialGyms];

export const resetGyms = () => {
  gyms.splice(0, gyms.length, ...initialGyms.map(g => ({
    ...g,
    reviews: [...g.reviews]
  })));
};