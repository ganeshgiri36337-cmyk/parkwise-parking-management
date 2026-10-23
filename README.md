# ParkWise Parking Management

A browser-based parking management app adapted from the original C++ console project. It supports vehicle entry, duplicate checks, slot assignment, vehicle search, checkout fee calculation, and a 10-slot overview. Parking data is saved in the current browser using `localStorage`.

## Run locally

Open `index.html` in a modern browser. No build step or package installation is needed.

## Deploy with GitHub Pages

The included GitHub Actions workflow deploys the static site when code is pushed to the `main` branch.

1. Create a GitHub repository and push these files to its `main` branch.
2. In the repository, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source.
3. Open the **Actions** tab and wait for **Deploy ParkWise to GitHub Pages** to complete.
4. GitHub Pages will show the published site URL in the deployment details.

Each visitor's parking records stay in that visitor's browser and are not shared between devices or users. The original C++ console program remains available as `parking.cpp`.
