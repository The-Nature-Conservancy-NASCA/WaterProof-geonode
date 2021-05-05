CREATE OR REPLACE FUNCTION public.__wp_intake_emptycols(element_id integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
execute format('UPDATE waterproof_intake_elementsystem 
	SET q_l_s = NULL, 
		awy = NULL,
		cn_mg_l = NULL,
		cp_mg_l = NULL,
		csed_mg_l = NULL,
		wn_kg = NULL,
		wn_ret_kg = NULL,
		wsed_ton = NULL,
		wsed_ret_ton = NULL,
		wp_ret_ton = NULL,
		wp_kg = NULL WHERE intake_id = %s',element_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_intake_emptycols(element_id integer, q_l_s character varying, awy character varying, cn_mg_l character varying, cp_mg_l character varying, csed_mg_l character varying, wn_kg character varying, wn_ret_kg character varying, wsed_ton character varying, wsed_ret_ton character varying, wp_ret_ton character varying, wp_kg character varying)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
UPDATE waterproof_intake_elementsystem 
	SET q_l_s = NULL, 
		awy = NULL,
		cn_mg_l = NULL,
		cp_mg_l = NULL,
		csed_mg_l = NULL,
		wn_kg = NULL,
		wn_ret_kg = NULL,
		wsed_ton = NULL,
		wsed_ret_ton = NULL,
		wp_ret_ton = NULL,
		wp_kg = NULL WHERE id = element_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_intake_insert_report(element_id double precision, intake_id integer, year integer, user_id integer, awy double precision, cn_mg_l double precision, cp_mg_l double precision, csed_mg_l double precision, wn_kg double precision, wp_kg double precision, wsed_ton double precision, wn_ret_kg double precision, wp_ret_kg double precision, wsed_ret_ton double precision, study_case_id integer, scenario character varying)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN				
		INSERT INTO waterproof_reports_wb_intakes (
			element_id,intake_id,year,user_id,awy,
			cn_mg_l, cp_mg_l, csed_mg_l, wn_kg, wp_kg,
			wsed_ton, wn_ret_kg, wp_ret_kg, wsed_ret_ton, study_case_id,scenario ) 
			VALUES (element_id,intake_id,year,user_id,awy,
			cn_mg_l, cp_mg_l, csed_mg_l, wn_kg, wp_kg,
			wsed_ton, wn_ret_kg, wp_ret_kg, wsed_ret_ton, study_case_id,scenario);
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_ptap_insert_report(element_id double precision, ptap_id integer, year integer, user_id integer, awy double precision, cn_mg_l double precision, cp_mg_l double precision, csed_mg_l double precision, wn_kg double precision, wp_kg double precision, wsed_ton double precision, wn_ret_kg double precision, wp_ret_kg double precision, wsed_ret_ton double precision, study_case_id integer, scenario character varying)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN				
		INSERT INTO waterproof_reports_wb_ptap_ (
			element_id,ptap_id,year,user_id,awy,
			cn_mg_l, cp_mg_l, csed_mg_l, wn_kg, wp_kg,
			wsed_ton, wn_ret_kg, wp_ret_kg, wsed_ret_ton, study_case_id,scenario ) 
			VALUES (element_id,ptap_id,year,user_id,awy,
			cn_mg_l, cp_mg_l, csed_mg_l, wn_kg, wp_kg,
			wsed_ton, wn_ret_kg, wp_ret_kg, wsed_ret_ton, study_case_id,scenario);
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_ptap_normquality(csinfra_id integer)
 RETURNS TABLE(drinking_water_standard_code integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query 
				select 
			discost.drinking_water_standard_code
			from waterproof_intake_elementsystem elem
			join waterproof_intake_intake intake ON elem.intake_id = intake.id
			join waterproof_parameters_cities city ON city.id = intake.city_id
			join waterproof_parameters_managmentcosts_discount discost ON discost.country_id = city.country_id
			where elem.id = csinfra_id;
    END;
$function$
;


CREATE OR REPLACE FUNCTION public.__wpget_nbs_data(study_cases_id integer)
 RETURNS TABLE(nbs_name text, time_max_benefit integer, benefit_t0 numeric, period integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select nbs.name::text nbs_name, max_benefit_req_time time_max_benefit, profit_pct_time_inter_assoc::numeric(10,2) benefit_t0, analysis_period_value from 
						waterproof_study_cases_studycases sc 
						left join waterproof_study_cases_studycases_nbs sc_nbs
						on sc.id = sc_nbs.studycases_id 
						left join waterproof_nbs_ca_waterproofnbsca nbs
						on sc_nbs.waterproofnbsca_id = nbs.id
						where sc.id = study_cases_id;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wpgetawybycatchment(catchment_id integer)
 RETURNS TABLE(id_c integer, awy double precision)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select es.id,
						case 
							when es.awy is null then 0
							else es.awy
						end as awy
						from waterproof_intake_elementsystem es
						where intake_id = catchment_id and not es.is_external						
union
select es.id,
						case 
							when vt.water_volume is null then 0
							else vt.water_volume
						end as awy
						from waterproof_intake_elementsystem es
						join waterproof_intake_valuesTime vt on es.id = vt.element_id 
						where intake_id = catchment_id and es.is_external and vt.year = 1;	
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.__wpgetawybyptap(ptap_id integer)
 RETURNS TABLE(id_c integer, awy double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select es.id as element_id,
						case 
							when es.element_awy is null then 0
							else es.element_awy
						end as awy
						from public.waterproof_treatment_plants_element es
						where element_plant_id = ptap_id
						order by es.id;	
END
$function$
;

CREATE OR REPLACE FUNCTION public.__wpgetnbycatchment(catchment_id integer)
 RETURNS TABLE(id_c integer, n double precision)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select es.id,
						case 
							when es.wn_kg is null then 0
							else es.wn_kg
						end as awy
						from waterproof_intake_elementsystem es
						where intake_id = catchment_id;	
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.__wpgetnbyptap(ptap_id integer)
 RETURNS TABLE(id_c integer, n double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select es.id as element_id,
						case 
							when es.element_wn_kg is null then 0
							else es.element_wn_kg
						end as n
						from waterproof_treatment_plants_element es
						where element_plant_id = ptap_id
						order by es.id;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wpgetpbycatchment(catchment_id integer)
 RETURNS TABLE(id_c integer, p double precision)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select es.id,
						case 
							when es.wp_kg is null then 0
							else es.wp_kg
						end as awy
						from waterproof_intake_elementsystem es
						where intake_id = catchment_id;	
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.__wpgetpbyptap(ptap_id integer)
 RETURNS TABLE(id_c integer, p double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select es.id as element_id,
						case 
							when es.element_wp_kg is null then 0
							else es.element_wp_kg
						end as wp
						from waterproof_treatment_plants_element es
						where element_plant_id = ptap_id
						order by es.id;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wpgetpercentagesbycatchment(catchment_id integer)
 RETURNS TABLE(from_element integer, pwater numeric, retsed numeric, retn numeric, retp numeric)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select id as From_element,
transported_water as PWater,
sediment as RetSed,
nitrogen as RetN,
phosphorus as RetP
from waterproof_intake_elementsystem
where intake_id = catchment_id;	
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.__wpgetpercentagesbyptap(ptap_id integer)
 RETURNS TABLE(from_element integer, pwater numeric, retsed numeric, retn numeric, retp numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query 
		SELECT DISTINCT waterproof_treatment_plants_element.id as From_Element,
(CASE 
 	WHEN waterproof_treatment_plants_function.function_transported_water IS NULL 
 	THEN 100 
 	ELSE CAST(waterproof_treatment_plants_function.function_transported_water AS NUMERIC) END) AS PWater,
(CASE WHEN waterproof_treatment_plants_function.function_sediments_retained IS NULL THEN '0' ELSE CAST(waterproof_treatment_plants_function.function_sediments_retained AS NUMERIC) END) AS RetSed,
(CASE WHEN waterproof_treatment_plants_function.function_nitrogen_retained IS NULL THEN '0' ELSE CAST(waterproof_treatment_plants_function.function_nitrogen_retained AS NUMERIC) END) AS RetN,
(CASE WHEN waterproof_treatment_plants_function.function_phosphorus_retained IS NULL THEN '0' ELSE CAST(waterproof_treatment_plants_function.function_phosphorus_retained AS NUMERIC) END) AS Retp
FROM waterproof_treatment_plants_element
LEFT OUTER JOIN waterproof_treatment_plants_function ON
(waterproof_treatment_plants_function.function_plant_id = waterproof_treatment_plants_element.element_plant_id
AND waterproof_treatment_plants_function.function_graph_id = waterproof_treatment_plants_element.element_graph_id)
WHERE waterproof_treatment_plants_element.element_plant_id = ptap_id;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wpgetqbycatchment(catchment_id integer)
 RETURNS TABLE(element integer, year integer, value numeric)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select es.id as element, q.year, q.value
from waterproof_intake_intake intake
join waterproof_intake_waterextraction q on intake.demand_parameters_id = q.demand_id
join waterproof_intake_elementsystem es on intake.id = es.intake_id and es.normalized_category = 'EXTRACTIONCONNECTION'
where intake.id = catchment_id and q.year = 1
order by q.year;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.__wpgetqbycatchmentdis(catchment_id integer)
 RETURNS TABLE(element integer, year integer, value numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select es.id as element, q.year, q.value
from waterproof_intake_intake intake
join waterproof_intake_waterextraction q on intake.demand_parameters_id = q.demand_id
join waterproof_intake_elementsystem es on intake.id = es.intake_id and es.normalized_category = 'EXTRACTIONCONNECTION'
where intake.id = catchment_id
order by q.year;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wpgetqbyptap(ptap_id integer)
 RETURNS TABLE(element integer, value double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select es.id as element, es.element_q_l as value
		from waterproof_treatment_plants_element es 
		where es.element_plant_id = ptap_id and es.element_normalize_category='PTAP Input';
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wpgetqbyptapdis(ptap_id integer)
 RETURNS TABLE(element integer, value double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select es.id as element, es.element_q_l as value
		from waterproof_treatment_plants_element es 
		where es.element_plant_id = ptap_id;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wpgetsedbycatchment(catchment_id integer)
 RETURNS TABLE(id_c integer, sed double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select es.id,
						case 
							when es.wsed_ton is null then 0
							else es.wsed_ton
						end as awy
						from waterproof_intake_elementsystem es
						where intake_id = catchment_id;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wpgetsedbyptap(ptap_id integer)
 RETURNS TABLE(id_c integer, sed double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select es.id as element_id,
						case 
							when es.element_csed_mg_l is null then 0
							else es.element_csed_mg_l
						end as sed
						from public.waterproof_treatment_plants_element es
						where element_plant_id = ptap_id
						order by es.id;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wpgettopologybycatchment(catchment_id integer)
 RETURNS TABLE(from_field integer, to_field integer)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select target_t.source_id From_element, target_t.target_id To_Element
from waterproof_intake_elementsystem es
join waterproof_intake_elementconnections source_t on es.id = source_t.source_id
join waterproof_intake_elementconnections target_t on es.id = target_t.source_id
where es.intake_id = catchment_id;	
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.__wpgettopologybyptap(ptap_id integer)
 RETURNS TABLE(from_field integer, to_field integer)
 LANGUAGE plpgsql
 ROWS 10
AS $function$
BEGIN
  return query 
  select 
    es.id  as From_element,
	es.id+1 as To_Element
  from
	waterproof_treatment_plants_element es
	where es.element_plant_id = ptap_id
	order by From_element
	limit 12;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wpupdate_parameter(element_id integer, parametername character varying, valueparameter double precision)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN				
				EXECUTE format('UPDATE waterproof_intake_elementsystem SET %I = %s WHERE id = %s',parametername,
							   valueParameter,
							  element_id);
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wpupdate_parameter_ptap(element_id integer, parametername character varying, valueparameter double precision)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN				
				EXECUTE format('UPDATE waterproof_treatment_plants_element SET %I = %s WHERE id = %s',parametername,
							   valueParameter,
							  element_id);
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_biophysycal_params(macro_value text, default_value text, user_value integer)
 RETURNS TABLE(lucode integer, lulc_desc text, description text, kc real, root_depth integer, usle_c integer, usle_p real, load_n real, eff_n real, load_p integer, eff_p real, crit_len_n integer, crit_len_p integer, proportion_subsurface_n integer, cn_a integer, cn_b integer, cn_c integer, cn_d integer, kc_1 real, kc_2 real, kc_3 real, kc_4 real, kc_5 real, kc_6 real, kc_7 real, kc_8 real, kc_9 real, kc_10 real, kc_11 real, kc_12 real, c_above integer, c_below integer, c_soil integer, c_dead integer, sed_exp integer, sed_ret integer, rough_rank real, cover_rank real, p_ret real, p_exp integer, n_ret real, n_exp real, native_veg integer, lulc_veg integer, macro_region text, "default" text, "user" text, id integer, intake_id integer, study_case_id integer, user_id integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select *
			from waterproof_parameters_biophysical param WHERE param.macro_region=macro_value AND param.default=default_value;	
    END;
$function$
;


CREATE OR REPLACE FUNCTION public.get_default_biophysycal_params(macro_value text, default_value text)
 RETURNS TABLE(lucode integer, lulc_desc text, description text, kc real, root_depth integer, usle_c integer, usle_p real, load_n real, eff_n real, load_p integer, eff_p real, crit_len_n integer, crit_len_p integer, proportion_subsurface_n integer, cn_a integer, cn_b integer, cn_c integer, cn_d integer, kc_1 real, kc_2 real, kc_3 real, kc_4 real, kc_5 real, kc_6 real, kc_7 real, kc_8 real, kc_9 real, kc_10 real, kc_11 real, kc_12 real, c_above integer, c_below integer, c_soil integer, c_dead integer, sed_exp integer, sed_ret integer, rough_rank real, cover_rank real, p_ret real, p_exp integer, n_ret real, n_exp real, native_veg integer, lulc_veg integer, macro_region text, "default" text, id integer, intake_id integer, study_case_id integer, user_id integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select *
			from waterproof_parameters_biophysical_test param WHERE param.user_id=1000 AND param.macro_region=macro_value AND param.default=default_value;	
    END;
$function$
;


CREATE OR REPLACE FUNCTION public.get_user_biophysycal_params(macro_value text, default_value text, intake_value integer, study_case integer, user_value integer)
 RETURNS TABLE(lucode integer, lulc_desc text, description text, kc real, root_depth integer, usle_c integer, usle_p real, load_n real, eff_n real, load_p integer, eff_p real, crit_len_n integer, crit_len_p integer, proportion_subsurface_n integer, cn_a integer, cn_b integer, cn_c integer, cn_d integer, kc_1 real, kc_2 real, kc_3 real, kc_4 real, kc_5 real, kc_6 real, kc_7 real, kc_8 real, kc_9 real, kc_10 real, kc_11 real, kc_12 real, c_above integer, c_below integer, c_soil integer, c_dead integer, sed_exp integer, sed_ret integer, rough_rank real, cover_rank real, p_ret real, p_exp integer, n_ret real, n_exp real, native_veg integer, lulc_veg integer, macro_region text, "default" text, id integer, intake_id integer, study_case_id integer, user_id integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select *
			from waterproof_parameters_biophysical_test param WHERE param.macro_region=macro_value AND param.default=default_value AND param.intake_id=intake_value AND param.study_case_id=study_case AND param.user_id=user_value; 
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_catchment_basin(idcatchment integer)
 RETURNS TABLE(id integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select basin.basin_id
			from waterproof_intake_polygon basin WHERE intake_id=idcatchment;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.getactivities(iduser integer)
 RETURNS TABLE(name character varying, unit_implementation_cost numeric, unit_maintenance_cost numeric)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query 
			select nbs.name,nbs.unit_implementation_cost, nbs.unit_maintenance_cost
				from waterproof_nbs_ca_waterproofnbsca nbs
				where added_by_id = iduser;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.getactivityshp(iduser integer)
 RETURNS TABLE(id integer, activity character varying, action character varying, geom geometry)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query 					
				select shp.id,nbs.name,shp.action,shp.area
					from waterproof_nbs_ca_waterproofnbsca nbs
					join waterproof_nbs_ca_activityshapefile shp on nbs.activity_shapefile_id = shp.id
					where nbs.added_by_id = iduser;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.getallbasins()
 RETURNS TABLE(id numeric, continent character varying, symbol character varying, code numeric, label character varying)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select b.id, b.continent, b.symbol, b.code,b.label
			from waterproof_intake_basins b;	
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.getbasin(idbasin integer)
 RETURNS TABLE(id numeric, continent character varying, symbol character varying, code numeric, label character varying)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select b.id, b.continent, b.symbol, b.code,b.label
			from waterproof_intake_basins b
			where b.id = idbasin;	
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.getbasinbylabel(labelbasin character varying)
 RETURNS TABLE(id numeric, continent character varying, symbol character varying, code numeric, label character varying)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select b.id, b.continent, b.symbol, b.code,b.label
			from waterproof_intake_basins b
			where b.label = labelBasin;	
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.getcasecatchments(idcase integer)
 RETURNS TABLE(id integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select intake.id
			from waterproof_intake_intake intake WHERE intake.id=6 OR intake.id=9;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.getcsinfra(cs_id integer)
 RETURNS TABLE(id integer, name character varying, nitrogen numeric, normalized_category character varying, phosporus numeric, sediment numeric, intake_id integer, q_l_s double precision, awy double precision, cn_mg_l double precision, cp_mg_l double precision, csed_mg_l double precision, wn_kg double precision, wn_ret_kg double precision, wp_ret_ton double precision, wsed_ret_ton double precision, wsed_ton double precision, wp_kg double precision, graphid integer, transported_water numeric, is_external boolean)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select es.id, es.name, es.nitrogen,es.normalized_category,es.phosphorus,
		es.sediment,es.intake_id,es.q_l_s,es.awy,es.cn_mg_l,es.cp_mg_l,es.csed_mg_l,es.wn_kg,
		es.wn_ret_kg,es.wp_ret_ton,es.wsed_ret_ton,es.wsed_ton,es.wp_kg,es."graphId",es.transported_water,
		es.is_external
			from waterproof_intake_elementsystem es
			where es.normalized_category = 'CSINFRA'
			and es.id = cs_id;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.getconstant(idbasin integer, constantname character varying)
 RETURNS TABLE(id_constant integer, name character varying, value character varying, id_basin integer)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select *
			from waterproof_pr_constants c
			where c.id_basin = idbasin
			and c.name = constantname;
    END;
    $function$
;


CREATE OR REPLACE FUNCTION public.getcsinfras(csinfras_array character varying)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
tmp int;
BEGIN
    EXECUTE format('SELECT * FROM waterproof_intake_elementsystem WHERE ID IN (%s)'
                ,csinfras_array);
END
$function$
;

CREATE OR REPLACE FUNCTION public.getobjectives(idobj integer)
 RETURNS TABLE(name character varying, id_obj integer)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query 
			select objective_alias,id_objective
				from waterproof_pr_objectives obj
				where id_objective = idobj;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.getparameterbyname(name_parameter character varying)
 RETURNS TABLE(id_tipo_parametro integer, nombre character varying, cut boolean, constant boolean, suffix boolean, empty boolean, file boolean, folder boolean, out_path boolean, calc boolean)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select p.id_tipo_parametro, p.nombre, p.cut,p.constant,p.suffix,p.empty,p.file,p.folder,
			p.out_path,p.calc
			from waterproof_tbl_pr_parametro p
			where p.nombre = name_parameter;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.getparametersbymodel(model_name character varying)
 RETURNS TABLE(id_tipo_parametro integer, nombre character varying, cut boolean, constant boolean, suffix boolean, empty boolean, file boolean, folder boolean, out_path boolean, calc boolean, input_user boolean, biophysical_parameters boolean, from_preproc boolean, rios_type character varying)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select p.id_tipo_parametro, p.nombre,p.cut, p.constant,p.suffix,p.empty,p.file,
				p.folder,p.out_path,p.calc,p.inputuser,p.biophysical_parameters,p.from_preproc,p.rios_type
				from waterproof_pr_parametro p inner join
				waterproof_pr_parameter_model pm on p.id_tipo_parametro = pm.id_parameter
				inner join waterproof_pr_models m on pm.id_model = m.id_modelo
				where m.nombre = model_name;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.getparametersbyobj(idbasin integer, idobj integer)
 RETURNS TABLE(nombre character varying, basin integer, ruta character varying)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query 
			select p.nombre,pr.id_basin,pr.ruta
				from waterproof_pr_parameter_objective po
				join waterproof_pr_parametro p on po.id_parameter = p.id_tipo_parametro
				join waterproof_pr_parametro_ruta pr on p.id_tipo_parametro = pr.id_parametro
				where id_objective = idobj and pr.id_basin = idbasin;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.getparametersmodel(idbasin integer, model character varying)
 RETURNS TABLE(name character varying, ruta character varying, cut boolean, constant boolean, suffix boolean, empty boolean, file boolean, folder boolean, out_path boolean, out_folder character varying, out_folder_quality character varying, calc boolean, inputuser boolean, biophysical_parameters boolean, from_preproc boolean, rios_type character varying)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query 
			select p.nombre, pr.ruta, p.cut, p.constant, p.suffix,
			p.empty, p.file, p.folder,p.out_path,m.out_folder,m.out_folder_quality,p.calc,
			p.inputuser, p.biophysical_parameters,p.from_preproc, p.rios_type
			from waterproof_pr_models m inner join
			waterproof_pr_parameter_model pm on m.id_modelo = pm.id_model
			inner join waterproof_pr_parametro p on pm.id_parameter = p.id_tipo_parametro
			inner join waterproof_pr_parametro_ruta pr on pr.id_parametro = p.id_tipo_parametro
			where m.nombre = model and pr.id_basin = idbasin
			and p.id_tipo_parametro not in (select distinct p.id_tipo_parametro
			from waterproof_pr_parameter_objective po
			join waterproof_pr_parametro p on po.id_parameter = p.id_tipo_parametro);
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.getpathbasinparameter(idbasin integer, id_parameter integer)
 RETURNS TABLE(path character varying)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select ruta
			from waterproof_pr_parametro_ruta
			where id_basin = idBasin and id_parametro = id_parameter;	
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.gettransformations(nbs_name character varying)
 RETURNS TABLE(from_lucode integer, from_cob character varying, to_lucode integer, to_cob character varying)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select from_lulc.lucode as from_lucode,ra.name as from_cob,to_lulc.lucode  as to_lucode, rtrans.name as to_cob
						from waterproof_nbs_ca_waterproofnbsca nbs
						join waterproof_nbs_ca_waterproofnbsca_rios_transformations rt on nbs.id = rt.waterproofnbsca_id
						join waterproof_nbs_ca_riostransformation rtrans on rt.riostransformation_id = rtrans.id
						join waterproof_nbs_ca_riosactivity ra on ra.id = rtrans.activity_id
						join waterproof_pr_lulc from_lulc on ra.lucode = from_lulc.lucode
						join waterproof_pr_lulc to_lulc on rtrans.lucode = to_lulc.lucode
						where nbs.name = nbs_name;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.gettransformations(nbs_id integer)
 RETURNS TABLE(from_lucode integer, from_cob character varying, to_lucode integer, to_cob character varying)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query select from_lulc.lucode as from_lucode,ra.name as from_cob,to_lulc.lucode  as to_lucode, rtrans.name as to_cob
						from waterproof_nbs_ca_waterproofnbsca nbs
						join waterproof_nbs_ca_waterproofnbsca_rios_transformations rt on nbs.id = rt.waterproofnbsca_id
						join waterproof_nbs_ca_riostransformation rtrans on rt.riostransformation_id = rtrans.id
						join waterproof_nbs_ca_riosactivity ra on ra.id = rtrans.activity_id
						join waterproof_pr_lulc from_lulc on ra.lucode = from_lulc.lucode
						join waterproof_pr_lulc to_lulc on rtrans.lucode = to_lulc.lucode
						where nbs.id = nbs_id;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.gettransitions(iduser integer)
 RETURNS TABLE(name character varying, file_name character varying, transition_type character varying, id_transition character varying, label character varying)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query 
			select nbs.name,nbs.file_name, nbs.transition_type,nbs.id_transition,
			nbs.label
				from waterproof_nbs_ca_riostransition nbs;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.gettransitions()
 RETURNS TABLE(name character varying, file_name character varying, transition_type character varying, id_transition character varying, label character varying)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query 
			select nbs.name,nbs.file_name, nbs.transition_type,nbs.id_transition,
			nbs.label
				from waterproof_nbs_ca_riostransition nbs;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.insertconcentrationsinvest(id_intake integer, elementtype character varying, awy_m double precision, wsed double precision, wn double precision, wp double precision, csed double precision, cn double precision, cp double precision)
 RETURNS void
 LANGUAGE plpgsql
AS $function$    BEGIN
		UPDATE WATERPROOF_INTAKE_ELEMENTSYSTEM es
		   SET   (awy, wsed_ton, wn_kg, wp_kg, csed_mg_l, cn_mg_l, cp_mg_l) = (awy_m,wsed,wn,wp,csed,cn,cp)
		   WHERE  es.intake_id = id_intake and normalized_category = elementType;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.intersectmacroregionfromcoords(x double precision, y double precision)
 RETURNS TABLE(id_macroregion integer)
 LANGUAGE plpgsql
AS $function$	DECLARE
		row_cnt integer;
    BEGIN
		create temp table tt as
		  select b.id::integer
			from waterproof_intake_basins b
			where b.y_min <= y
			and b.y_max > y
			and b.x_max >= x
			and b.x_min < x;
		row_cnt = (select count(*) from tt);
		
		
		
		if row_cnt > 1 then		
			return query select id::int
				from waterproof_intake_basins b
				where id in (select id from tt)
				and st_intersects(b.geom,ST_SetSRID(ST_MakePoint(x,y),4326));
		else
			return query select * from tt;
		end if;		
    END;
    $function$
;
