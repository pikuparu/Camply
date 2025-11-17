// public/javascript/clusterMap.js
document.addEventListener('DOMContentLoaded', () => {
  // Only run when SDK is present and data exists
  if (typeof maptilersdk === 'undefined') {
    console.error('MapTiler SDK not loaded (clusterMap).');
    return;
  }
  if (typeof maptilerApiKey === 'undefined') {
    console.error('maptilerApiKey is not defined (clusterMap).');
    return;
  }
  if (typeof campgrounds === 'undefined') {
    // page doesn't have campgrounds -> nothing to do
    return;
  }

  maptilersdk.config.apiKey = maptilerApiKey;

  const clusterMap = new maptilersdk.Map({
    container: 'cluster-map',
    style: maptilersdk.MapStyle.BRIGHT,
    center: [-103.59179687498357, 40.66995747013945],
    zoom: 3
  });

  clusterMap.on('load', function () {
    clusterMap.addSource('campgrounds', {
      type: 'geojson',
      data: campgrounds,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    clusterMap.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'campgrounds',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#00BCD4',
          10,
          '#2196F3',
          30,
          '#3F51B5'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          15,
          10,
          20,
          30,
          25
        ]
      }
    });

    clusterMap.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'campgrounds',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    clusterMap.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'campgrounds',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    });

    // cluster click
    clusterMap.on('click', 'clusters', async (e) => {
      const features = clusterMap.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0].properties.cluster_id;
      const zoom = await clusterMap.getSource('campgrounds').getClusterExpansionZoom(clusterId);
      clusterMap.easeTo({ center: features[0].geometry.coordinates, zoom });
    });

    // unclustered point click
    clusterMap.on('click', 'unclustered-point', function (e) {
      const { popUpMarkup } = e.features[0].properties;
      const coordinates = e.features[0].geometry.coordinates.slice();
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      new maptilersdk.Popup()
        .setLngLat(coordinates)
        .setHTML(popUpMarkup)
        .addTo(clusterMap);
    });

    clusterMap.on('mouseenter', 'clusters', () => {
      clusterMap.getCanvas().style.cursor = 'pointer';
    });
    clusterMap.on('mouseleave', 'clusters', () => {
      clusterMap.getCanvas().style.cursor = '';
    });
  });
});
