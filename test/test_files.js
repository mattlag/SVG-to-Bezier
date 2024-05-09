export const enabledTestCategories = {
	"Basic Shapes": true,
	"Multi-tag Shapes": true,
	"Path Commands": true,
	"Complex Paths": true,
	"Single Transform": true,
	"Multi Transforms": true,
	"Inherited Transforms": true,
	"Font Glyphs": true,
	"Edge Cases": false,
};

export const testFiles = [
	{ category: "Basic Shapes", name: "shape_circle" },
	{ category: "Basic Shapes", name: "shape_ellipse" },
	{ category: "Basic Shapes", name: "shape_polygon" },
	{ category: "Basic Shapes", name: "shape_polyline" },
	{ category: "Basic Shapes", name: "shape_rect" },
	{ category: "Multi-tag Shapes", name: "shape_circle_multi" },
	{ category: "Multi-tag Shapes", name: "shape_ellipse_multi" },
	{ category: "Multi-tag Shapes", name: "shape_polygon_multi" },
	{ category: "Multi-tag Shapes", name: "shape_polyline_multi" },
	{ category: "Multi-tag Shapes", name: "shape_rect_multi" },
	{ category: "Path Commands", name: "path_A" },
	{ category: "Path Commands", name: "path_A2" },
	{ category: "Path Commands", name: "path_Ar" },
	{ category: "Path Commands", name: "path_Ar2" },
	{ category: "Path Commands", name: "path_C" },
	{ category: "Path Commands", name: "path_Cr" },
	{ category: "Path Commands", name: "path_HV" },
	{ category: "Path Commands", name: "path_HVr" },
	{ category: "Path Commands", name: "path_L" },
	{ category: "Path Commands", name: "path_Lr" },
	{ category: "Path Commands", name: "path_M" },
	{ category: "Path Commands", name: "path_Mr" },
	{ category: "Path Commands", name: "path_Q" },
	{ category: "Path Commands", name: "path_Qr" },
	{ category: "Path Commands", name: "path_S" },
	{ category: "Path Commands", name: "path_Sr" },
	{ category: "Path Commands", name: "path_T" },
	{ category: "Path Commands", name: "path_Tr" },
	{ category: "Complex Paths", name: "multi_shape_1" },
	{ category: "Complex Paths", name: "multi_shape_2" },
	{ category: "Complex Paths", name: "multi_shape_3" },
	{ category: "Complex Paths", name: "multi_shape_4" },
	{ category: "Complex Paths", name: "multi_shape_5" },
	{ category: "Single Transform", name: "transform_matrix" },
	{ category: "Single Transform", name: "transform_translate" },
	{ category: "Single Transform", name: "transform_scale" },
	{ category: "Single Transform", name: "transform_skewx_position" },
	{ category: "Single Transform", name: "transform_skewy_position" },
	{ category: "Single Transform", name: "transform_rotate" },
	{ category: "Single Transform", name: "transform_skewx" },
	{ category: "Single Transform", name: "transform_skewy" },
	{ category: "Multi Transforms", name: "transforms_attribute_order" },
	{ category: "Inherited Transforms", name: "inherited_transforms_one_level_one_transform" },
	{ category: "Inherited Transforms", name: "inherited_transforms_hierarchy_order" },
	{ category: "Inherited Transforms", name: "inherited_transforms_two_levels_one_transform" },
	{ category: "Inherited Transforms", name: "inherited_transforms_heart" },
	{ category: "Inherited Transforms", name: "inherited_transforms_mixed_levels_and_transforms" },
	{ category: "Font Glyphs", name: "font_libre_caslon_paren" },
	{ category: "Font Glyphs", name: "font_libre_caslon_s" },
	{ category: "Edge Cases", name: "error_not_enough_commands" },
	{ category: "Edge Cases", name: "error_blank" },
];