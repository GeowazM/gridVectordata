// rename table to ikonos
var ikonos = table;

// import module
var g = require('users/gena/packages:grid');                             // import functions for grid creation
                                                                         // Source: https://gee-community.github.io/GEE-Dev-Docs/staging/staging.html
                                                                         // Script: https://code.earthengine.google.com/ff50a3e4745b1e732b1b7ac8a12623b6

// export labeling
var export_name = "wv2_2015_grid_003";
var format = "GeoJSON";

// General variables
var total_features = ikonos.size();
//var roi_features = ikonos.filterBounds(roi).size();

// Print numbers of feature collections
//print('Count total number of features:', total_features);                // print total number of features.
//print('Counted features after filtering by size:', roi_features);        // print for region of interest

// Filter FeatureCollection (polyons) by Feature (polygon)               -> https://gis.stackexchange.com/questions/328118/subset-featurecollection-by-position-google-earth-engine & https://gis.stackexchange.com/questions/328118/subset-featurecollection-by-position-google-earth-engine
var ftr = ee.FeatureCollection(ikonos);//.filterBounds(roi));
//print('Filtered features',ftr);
//Map.addLayer(ftr, {}, 'ROI IKONOS footprints', true);

// Get one feature
//var f = ee.Feature(ftr.first());
//print('Selected feature', f);
//Map.addLayer(f, {}, 'First IKONOS footprints', true);

// Create grid of one feature
//var dx = 0.03;                                                           // grid heigth
//var dy = 0.03;                                                           // grid width
//var fgrid = ee.FeatureCollection(g.generateGridForGeometry(f.bounds(), dx, dy));               // generate grid for one feature via bbox & heigth/with
//Map.addLayer(fgrid, {palette: ['ffff00']}, 'One feature grid', true);               // show created grid on the map



// Create grid of all features
var createGrid = function(feature){
    var dx = 0.03;                                                                                      // grid heigth
    var dy = 0.03;                                                                                      // grid width
    var grid = ee.FeatureCollection(g.generateGridForGeometry(feature.bounds(), dx, dy));               // generate grid for one feature via bbox & heigth/with

    var year = feature.get("date");                                   // Get attributes
    var kg = feature.get("Koeppen-Ge");
    var oid = feature.get("OBJECTID");
    var fid = feature.get("TARGET_FID");
    var noSeg = feature.get("noSegments");
    var ua = feature.get("urban_area");
    var segKm = feature.get("seg_pr_km2");
    var ratio_UaS = feature.get("ratio_UaS");
    var reg = feature.get("UNSD_M49_1");


    var loop = function(grid_feature){
      var gr = grid_feature.set({date:year});                        // write attributes into grid
      var gri = gr.set({klima:kg});
      var gridd = gri.set({objectID:oid});
      var gridN = gridd.set({featureID:fid});
      var gridNe = gridN.set({noSegments:noSeg});
      var gridNew = gridNe.set({urban_area:ua});
      var gridNewN = gridNew.set({seg_pr_km2:segKm});
      var gridNewNe = gridNewN.set({ratio_UrbSeg:ratio_UaS});
      var gridNewNew = gridNewNe.set({world_region:reg});
      return gridNewNew;
    };


    var newGrid = grid.map(loop);

    return newGrid;
};



var x = ftr.map(createGrid);
var xflat = x.flatten();//.limit(3500);
print('All features flatten', xflat.limit(150));
//print('All features', x);
//Map.addLayer(xflat, {}, 'All grids');                  // show created grid on the map




// Export the FeatureCollection to a KML file.
Export.table.toDrive({
  collection: xflat,
  description: export_name,
  fileFormat: format
});
