document.addEventListener("DOMContentLoaded", () => {
  if (typeof maptilersdk === "undefined") {
    console.error("MapTiler SDK not loaded (showPageMap).");
    return;
  }

  if (typeof maptilerApiKey === "undefined") {
    console.error("maptilerApiKey is not defined (showPageMap).");
    return;
  }

  if (typeof campground === "undefined") return;

  maptilersdk.config.apiKey = maptilerApiKey;

  const showPageMap = new maptilersdk.Map({
    container: "map",
    style: maptilersdk.MapStyle.BRIGHT,
    center: campground.geometry.coordinates,
    zoom: 10,
  });

  new maptilersdk.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
      new maptilersdk.Popup({ offset: 25 }).setHTML(
        `<h3>${campground.title}</h3><p>${campground.location}</p>`
      )
    )
    .addTo(showPageMap);
});
