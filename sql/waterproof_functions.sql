CREATE OR REPLACE FUNCTION public.__wp_check_nbs_transition_map(
	idnbs integer,
	transition character varying)
    RETURNS TABLE(trans_lucode character varying) 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $function$
BEGIN
		return query select rtransition.id_transition as trans_lucode
						from waterproof_nbs_ca_waterproofnbsca nbs
						join waterproof_nbs_ca_waterproofnbsca_rios_transformations rt on nbs.id = rt.waterproofnbsca_id
						join waterproof_nbs_ca_riostransformation rtrans on rt.riostransformation_id = rtrans.id
						join waterproof_nbs_ca_riosactivity ra on ra.id = rtrans.activity_id
						join waterproof_nbs_ca_riostransition rtransition on rtransition.id=ra.transition_id AND rtransition.id_transition=transition
						where nbs.id =idNbs;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_dissagregation_invest(
	intakes integer,cases integer)
    RETURNS TABLE(name character varying, awyres double precision, wsedres double precision, wnres double precision, wpres double precision, bfres double precision, wcres double precision) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
  return query 
	select 
	case 
		when type='NbS' then concat('NBS-Year_',year)
		else type
	end as name,
	awy AS AWY,
	wsed_ton as Wsed,
	wn_kg as WN,
	wp_kg as WP,
	bf_m3 as BF,
	wc_ton as WC
	from
	public.waterproof_reports_invest_results
	where intake_id=intakes and study_case_id = cases
	order by type,year;
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_dissagregation_nbs_first(
	studycase integer)
    RETURNS TABLE(name character varying, timeres integer, benefitres numeric, reference character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
  return query 
	select
		nbsca.name as NBS_Name,
		nbsca.max_benefit_req_time as Time_Max_Benefit,
		nbsca.profit_pct_time_inter_assoc as Benefit_t0,
		nbsca.slug as reference
		from
		waterproof_study_cases_studycases_nbs nbs
		join public.waterproof_nbs_ca_waterproofnbsca nbsca on nbs.nbs_id = nbsca.id
		where nbs.studycase_id=studycase;
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_dissagregation_nbs_second(
	studycase integer)
    RETURNS TABLE(namesbn character varying, timeres integer, areares double precision) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
  return query 
	select
	    rios.sbn,
	    rios.year,
		rios.area_converted_ha
		from
		public.waterproof_reports_rios_ipa rios
		join public.waterproof_nbs_ca_waterproofnbsca nbsca on nbsca.slug = rios.sbn
		where rios.study_case_id=studycase and rios.year <999
		order by rios.year,rios.sbn;
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_dissagregation_time(
	studycase integer)
    RETURNS TABLE(timeres integer) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
  return query 
	select 
	analysis_period_value 
	from waterproof_study_cases_studycases 
	where id = studycase;
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_get_activities(
	listnbs integer[])
    RETURNS TABLE(name character varying, unit_implementation_cost numeric, unit_maintenance_cost numeric, id integer) 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $function$
BEGIN
		return query 
			select nbs.slug,nbs.unit_implementation_cost, nbs.unit_maintenance_cost,nbs.id
				from waterproof_nbs_ca_waterproofnbsca nbs
				where nbs.id = ANY(listNbs);
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_get_activities_shapefiles(
	listnbs integer[])
    RETURNS TABLE(id integer, activity character varying, action character varying, geom geometry) 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $function$
BEGIN
		return query 					
				select shp.id,nbs.slug,shp.action,shp.area
					from waterproof_nbs_ca_waterproofnbsca nbs
					join waterproof_nbs_ca_activityshapefile shp on nbs.activity_shapefile_id = shp.id
					where nbs.id = ANY(listNbs);
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_get_biophysycal_consolidate(
	integer,
	character varying)
    RETURNS TABLE(lucode integer, lulc_desc text, description text, kc double precision, root_depth double precision, usle_c double precision, usle_p double precision, load_n double precision, eff_n double precision, load_p double precision, eff_p double precision, crit_len_n integer, crit_len_p integer, proportion_subsurface_n double precision, cn_a double precision, cn_b double precision, cn_c double precision, cn_d double precision, kc_1 double precision, kc_2 double precision, kc_3 double precision, kc_4 double precision, kc_5 double precision, kc_6 double precision, kc_7 double precision, kc_8 double precision, kc_9 double precision, kc_10 double precision, kc_11 double precision, kc_12 double precision, c_above double precision, c_below double precision, c_soil double precision, c_dead double precision, sed_exp double precision, sed_ret double precision, rough_rank double precision, cover_rank double precision, p_ret double precision, p_exp double precision, n_ret double precision, n_exp double precision, native_veg integer, lulc_veg integer, macro_region text, "default" text, id integer, intake_id integer, study_case_id integer, user_id integer) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
			return query select a.* 
					from public.waterproof_parameters_biophysical as a
					where a."default"='y' and a.macro_region=$2 and 
					a.lucode NOT IN (select b.lucode 
								from public.waterproof_parameters_biophysical as b
								where b."default"='N' and b.macro_region=$2 and b.study_case_id=$1)
					union
					select c.* 
					from public.waterproof_parameters_biophysical as c
					where c."default"='N' and c.macro_region=$2 and c.study_case_id=$1
					order by lucode asc;

END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_get_biophysycal_params(macro_value text,default_value text,user_value integer)
    RETURNS TABLE(lucode integer, lulc_desc text, description text, kc double precision, root_depth double precision, usle_c double precision, usle_p double precision, load_n double precision, eff_n double precision, load_p double precision, eff_p double precision, crit_len_n integer, crit_len_p integer, proportion_subsurface_n double precision, cn_a double precision, cn_b double precision, cn_c double precision, cn_d double precision, kc_1 double precision, kc_2 double precision, kc_3 double precision, kc_4 double precision, kc_5 double precision, kc_6 double precision, kc_7 double precision, kc_8 double precision, kc_9 double precision, kc_10 double precision, kc_11 double precision, kc_12 double precision, c_above double precision, c_below double precision, c_soil double precision, c_dead double precision, sed_exp double precision, sed_ret double precision, rough_rank double precision, cover_rank double precision, p_ret double precision, p_exp double precision, n_ret double precision, n_exp double precision, native_veg integer, lulc_veg integer, macro_region text, "default" text, id integer, intake_id integer, study_case_id integer, user_id integer) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		return query select *
			from waterproof_parameters_biophysical param WHERE param.macro_region=macro_value AND param.default=default_value;	
    END;
$BODY$;

CREATE OR REPLACE FUNCTION public.__wp_get_catchment_basin(idcatchment integer)
 RETURNS TABLE(id integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select basin.basin_id
			from waterproof_intake_polygon basin WHERE intake_id=idcatchment;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_get_closest_cities(x numeric, y numeric)
 RETURNS TABLE(id_city integer, city varchar, dist numeric, lon numeric, lat numeric)
 LANGUAGE plpgsql
AS $function$
DECLARE		
    BEGIN				
			return query SELECT id, name, ST_Distance(ST_SetSRID(ST_MakePoint(x,y),4326), geom)::numeric(8,5) AS dist, longitude::numeric(8,5) as lon, latitude::numeric(8,5) as lat
							FROM public.waterproof_parameters_cities
							ORDER BY dist LIMIT 5;
				
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_get_default_objectives_priorities(objective integer,transition_id integer,parameter_value integer)
    RETURNS TABLE(priority_value character) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		RETURN QUERY SELECT priorit.value as priority_value
			FROM waterproof_parameters_objetives_priorities priorit WHERE priorit.model=objective AND priorit.transition=transition_id 
			AND priorit.parameter=parameter_value AND priorit.default='y' AND priorit.user_id=1000;
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_get_default_transitions_priorities(objective integer,transition_id integer)
    RETURNS TABLE(priority_value character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		return query select priorit.value as priority_value
			from waterproof_parameters_transitions_priorities priorit WHERE priorit.model=objective AND priorit.transition=transition_id AND priorit.default='y'
			AND priorit.user_id=1000;	
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_get_nbs_budget(listnbs integer[],id_case integer)
    RETURNS TABLE(name character varying, unit_implementation_cost numeric, unit_maintenance_cost numeric, id integer, unit_oportunity_cost numeric, periodicity_maitenance integer, value numeric) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		return query 
			select nbs.slug as name,nbs.unit_implementation_cost, nbs.unit_maintenance_cost,nbs.id,nbs.unit_oportunity_cost,nbs.periodicity_maitenance,sc_nbs.value
				from waterproof_nbs_ca_waterproofnbsca nbs
				join waterproof_study_cases_studycases_nbs sc_nbs on sc_nbs.nbs_id=nbs.id AND sc_nbs.studycase_id=id_case
				where nbs.id = ANY(listnbs);
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_get_nbs_transformations(
	listnbs integer[])
    RETURNS TABLE(from_lucode integer, from_cob character varying, to_lucode integer, to_cob character varying, from_nbs character varying) 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $function$
BEGIN
		return query select from_lulc.lucode as from_lucode,ra.name as from_cob,to_lulc.lucode  as to_lucode, rtrans.name as to_cob,nbs.name as from_nbs
						from waterproof_nbs_ca_waterproofnbsca nbs
						join waterproof_nbs_ca_waterproofnbsca_rios_transformations rt on nbs.id = rt.waterproofnbsca_id
						join waterproof_nbs_ca_riostransformation rtrans on rt.riostransformation_id = rtrans.id
						join waterproof_nbs_ca_riosactivity ra on ra.id = rtrans.activity_id
						join waterproof_pr_lulc from_lulc on ra.lucode = from_lulc.lucode
						join waterproof_pr_lulc to_lulc on rtrans.lucode = to_lulc.lucode
						where nbs.id =ANY(listNbs) ;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_get_studycase_budget(idcase integer)
    RETURNS TABLE(analysis_type character varying, time_implement integer, annual_investment numeric, rellocated_remainder boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		return query select budget.analysis_type,budget.time_implement,budget.annual_investment,budget.rellocated_remainder
			from waterproof_study_cases_studycases budget WHERE budget.id=idcase;	
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_get_studycase_catchments(
	idcase integer)
    RETURNS TABLE(id integer) 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $function$
BEGIN
		return query select catchment.intake_id
			from waterproof_study_cases_studycases_intakes catchment WHERE studycases_id=idcase;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_get_studycase_nbs(
	idcase integer)
    RETURNS TABLE(id integer) 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $function$
BEGIN
		return query select nbs.nbs_id
			from waterproof_study_cases_studycases_nbs nbs WHERE studycase_id=idcase;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_get_studycase_objective(idcase integer)
    RETURNS TABLE(obj_id integer, obj_name character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		return query SELECT  all_objectives.id as obj_id ,all_objectives.name as obj_name FROM public.waterproof_study_cases_studycases_portfolios sc_objectives
			join waterproof_study_cases_portfolio all_objectives on sc_objectives.portfolio_id=all_objectives.id
			WHERE sc_objectives.studycases_id=idcase;
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_get_user_objectives_priorities(objective integer,transition_id integer,parameter_value integer,intake_value integer,user_value integer,studycase_id integer)
    RETURNS TABLE(priority_value character) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		RETURN QUERY SELECT priorit.value as priority_value
			FROM waterproof_parameters_objetives_priorities priorit WHERE priorit.model=objective AND priorit.transition=transition_id AND priorit.parameter=parameter_value 
			AND priorit.default='N' AND priorit.intake_id=intake_value AND priorit.user_id=user_value AND priorit.study_case_id=studyCase_id;	
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_get_user_transitions_priorities(objective integer,transition_id integer,intake_value integer,user_value integer,studycase_id integer)
    RETURNS TABLE(priority_value character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		RETURN QUERY SELECT priorit.value as priority_value
			FROM waterproof_parameters_transitions_priorities priorit WHERE priorit.model=objective AND priorit.transition=transition_id AND priorit.default='N'
			AND priorit.intake_id=intake_value AND priorit.user_id=user_value AND priorit.study_case_id=studyCase_id;	
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_getallbasins()
    RETURNS TABLE(id numeric, continent character varying, symbol character varying, code numeric, label character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		return query select b.id, b.continent, b.symbol, b.code,b.label
			from waterproof_intake_basins b;	
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_getbasin(
	idbasin integer)
    RETURNS TABLE(id numeric, continent character varying, symbol character varying, code numeric, label character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		return query select b.id, b.continent, b.symbol, b.code,b.label
			from waterproof_intake_basins b
			where b.id = idbasin;	
    END;
$BODY$;
;

CREATE OR REPLACE FUNCTION public.__wp_getbasinbylabel(labelbasin character varying)
    RETURNS TABLE(id numeric, continent character varying, symbol character varying, code numeric, label character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		return query select b.id, b.continent, b.symbol, b.code,b.label
			from waterproof_intake_basins b
			where b.label = labelBasin;	
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_getconstant(idbasin integer,constantname character varying)
    RETURNS TABLE(id_constant integer, name character varying, value character varying, id_basin integer) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		return query select *
			from waterproof_pr_constants c
			where c.id_basin = idbasin
			and c.name = constantname;
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_getcsinfra(cs_id integer)
    RETURNS TABLE(id integer, name character varying, nitrogen numeric, normalized_category character varying, phosporus numeric, sediment numeric, intake_id integer, q_l_s double precision, awy double precision, cn_mg_l double precision, cp_mg_l double precision, csed_mg_l double precision, wn_kg double precision, wn_ret_kg double precision, wp_ret_ton double precision, wsed_ret_ton double precision, wsed_ton double precision, wp_kg double precision, graphid integer, transported_water numeric, is_external boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		return query select es.id, es.name, es.nitrogen,es.normalized_category,es.phosphorus,
		es.sediment,es.intake_id,es.q_l_s,es.awy,es.cn_mg_l,es.cp_mg_l,es.csed_mg_l,es.wn_kg,
		es.wn_ret_kg,es.wp_ret_ton,es.wsed_ret_ton,es.wsed_ton,es.wp_kg,es."graphId",es.transported_water,
		es.is_external
			from waterproof_intake_elementsystem es
			where es.normalized_category = 'CSINFRA'
			and es.id = cs_id;
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_getobjectives(idobj integer)
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

CREATE OR REPLACE FUNCTION public.__wp_getparameterbyname(name_parameter character varying)
    RETURNS TABLE(id_tipo_parametro integer, nombre character varying, cut boolean, constant boolean, suffix boolean, empty boolean, file boolean, folder boolean, out_path boolean, calc boolean) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		return query select p.id_tipo_parametro, p.nombre, p.cut,p.constant,p.suffix,p.empty,p.file,p.folder,
			p.out_path,p.calc
			from waterproof_tbl_pr_parametro p
			where p.nombre = name_parameter;
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_getparametersbymodel(model_name character varying)
    RETURNS TABLE(id_tipo_parametro integer, nombre character varying, cut boolean, constant boolean, suffix boolean, empty boolean, file boolean, folder boolean, out_path boolean, calc boolean, input_user boolean, biophysical_parameters boolean, from_preproc boolean, rios_type character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		return query select p.id_tipo_parametro, p.nombre,p.cut, p.constant,p.suffix,p.empty,p.file,
				p.folder,p.out_path,p.calc,p.inputuser,p.biophysical_parameters,p.from_preproc,p.rios_type
				from waterproof_pr_parametro p inner join
				waterproof_pr_parameter_model pm on p.id_tipo_parametro = pm.id_parameter
				inner join waterproof_pr_models m on pm.id_model = m.id_modelo
				where m.nombre = model_name;
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_getparametersbyobj(idbasin integer, idobj integer)
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

CREATE OR REPLACE FUNCTION public.__wp_getparametersmodel(idbasin integer, model character varying)
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

CREATE OR REPLACE FUNCTION public.__wp_getpathbasinparameter(idbasin integer,id_parameter integer)
    RETURNS TABLE(path character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
		return query select ruta
			from waterproof_pr_parametro_ruta
			where id_basin = idBasin and id_parametro = id_parameter;	
    END;
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_gettransformationsbyname(nbs_name character varying)
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
						where nbs.slug = nbs_name;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.__wp_gettransformationsbyid(nbs_id integer)
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

CREATE OR REPLACE FUNCTION public.__wp_gettransitions(iduser integer)
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

CREATE OR REPLACE FUNCTION public.__wp_gettransitions()
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

CREATE OR REPLACE FUNCTION public.__wp_insertconcentrationsinvest(id_intake integer, elementtype character varying, awy_m double precision, wsed double precision, wn double precision, wp double precision, csed double precision, cn double precision, cp double precision)
 RETURNS void
 LANGUAGE plpgsql
AS $function$    BEGIN
		UPDATE WATERPROOF_INTAKE_ELEMENTSYSTEM es
		   SET   (awy, wsed_ton, wn_kg, wp_kg, csed_mg_l, cn_mg_l, cp_mg_l) = (awy_m,wsed,wn,wp,csed,cn,cp)
		   WHERE  es.intake_id = id_intake and normalized_category = elementType;
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

CREATE OR REPLACE FUNCTION public.__wp_intersectmacroregionfromcoords(
	x double precision,
	y double precision)
    RETURNS TABLE(id_macroregion integer) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE
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
$BODY$
;

CREATE OR REPLACE FUNCTION public.__wp_ptap_get_data_intakes(
	ptap_id integer,
	colfind character varying,
	scenario character varying)
    RETURNS TABLE(year integer, typecol double precision) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
	return query 
	EXECUTE format(' 
		select
		ele.year,
		SUM (ele.%I) as typecol
		from public.waterproof_treatment_plants_csinfra csin
		join public.waterproof_reports_wbintake ele ON csin.csinfra_elementsystem_id = ele.element 
		where csin.csinfra_plant_id = %s and ele.stage = %L
		group by ele.year;', colfind, ptap_id, scenario );
END
$BODY$
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
		return query select nbs.slug::text nbs_name, max_benefit_req_time time_max_benefit, profit_pct_time_inter_assoc::numeric(10,2) benefit_t0, analysis_period_value from 
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
   return query 
	select es.id as element, q.year as year, q.value as value
	from waterproof_intake_intake intake
	join waterproof_intake_waterextraction q on intake.demand_parameters_id = q.demand_id
	join waterproof_intake_elementsystem es on intake.id = es.intake_id and es.normalized_category = 'EXTRACTIONCONNECTION'
	where intake.id = catchment_id and q.year <= ((select analysis_period_value from public.waterproof_study_cases_studycases where id = studycases_in)+1)
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

CREATE OR REPLACE FUNCTION public.__wp_get_default_biophysycal_params(macro_value text, default_value text)
    RETURNS TABLE(lucode integer, lulc_desc text, description text, kc real, root_depth integer, usle_c integer, usle_p real, load_n real, eff_n real, load_p integer, eff_p real, crit_len_n integer, crit_len_p integer, proportion_subsurface_n integer, cn_a integer, cn_b integer, cn_c integer, cn_d integer, kc_1 real, kc_2 real, kc_3 real, kc_4 real, kc_5 real, kc_6 real, kc_7 real, kc_8 real, kc_9 real, kc_10 real, kc_11 real, kc_12 real, c_above integer, c_below integer, c_soil integer, c_dead integer, sed_exp integer, sed_ret integer, rough_rank real, cover_rank real, p_ret real, p_exp integer, n_ret real, n_exp real, native_veg integer, lulc_veg integer, macro_region text, "default" text, id integer, intake_id integer, study_case_id integer, user_id integer)
    LANGUAGE plpgsql
AS $function$
BEGIN
		return query select *
			from waterproof_parameters_biophysical_test param WHERE param.user_id=1000 AND param.macro_region=macro_value AND param.default=default_value;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_get_user_biophysycal_params(macro_value text, default_value text, intake_value integer, study_case integer, user_value integer)
 RETURNS TABLE(lucode integer, lulc_desc text, description text, kc real, root_depth integer, usle_c integer, usle_p real, load_n real, eff_n real, load_p integer, eff_p real, crit_len_n integer, crit_len_p integer, proportion_subsurface_n integer, cn_a integer, cn_b integer, cn_c integer, cn_d integer, kc_1 real, kc_2 real, kc_3 real, kc_4 real, kc_5 real, kc_6 real, kc_7 real, kc_8 real, kc_9 real, kc_10 real, kc_11 real, kc_12 real, c_above integer, c_below integer, c_soil integer, c_dead integer, sed_exp integer, sed_ret integer, rough_rank real, cover_rank real, p_ret real, p_exp integer, n_ret real, n_exp real, native_veg integer, lulc_veg integer, macro_region text, "default" text, id integer, intake_id integer, study_case_id integer, user_id integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select *
			from waterproof_parameters_biophysical_test param WHERE param.macro_region=macro_value AND param.default=default_value AND param.intake_id=intake_value AND param.study_case_id=study_case AND param.user_id=user_value; 
END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_getactivities(iduser integer)
 RETURNS TABLE(name character varying, unit_implementation_cost numeric, unit_maintenance_cost numeric)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query 
			select nbs.slug,nbs.unit_implementation_cost, nbs.unit_maintenance_cost
				from waterproof_nbs_ca_waterproofnbsca nbs
				where added_by_id = iduser;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.__wp_getactivityshp(iduser integer)
 RETURNS TABLE(id integer, activity character varying, action character varying, geom geometry)
 LANGUAGE plpgsql
AS $function$    BEGIN
		return query 					
				select shp.id,nbs.slug,shp.action,shp.area
					from waterproof_nbs_ca_waterproofnbsca nbs
					join waterproof_nbs_ca_activityshapefile shp on nbs.activity_shapefile_id = shp.id
					where nbs.added_by_id = iduser;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.__wp_getcasecatchments(idcase integer)
 RETURNS TABLE(id integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
		return query select intake.id
			from waterproof_intake_intake intake WHERE intake.id=6 OR intake.id=9;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_getcsinfras(csinfras_array character varying)
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

CREATE OR REPLACE FUNCTION public.__wp_get_default_biophysycal_params(
	macro_value text,
	default_value text)
    RETURNS TABLE(lucode integer, lulc_desc text, description text, kc double precision, root_depth double precision, usle_c double precision, usle_p double precision, load_n double precision, eff_n double precision, load_p double precision, eff_p double precision, crit_len_n integer, crit_len_p integer, proportion_subsurface_n double precision, cn_a double precision, cn_b double precision, cn_c double precision, cn_d double precision, kc_1 double precision, kc_2 double precision, kc_3 double precision, kc_4 double precision, kc_5 double precision, kc_6 double precision, kc_7 double precision, kc_8 double precision, kc_9 double precision, kc_10 double precision, kc_11 double precision, kc_12 double precision, c_above double precision, c_below double precision, c_soil double precision, c_dead double precision, sed_exp double precision, sed_ret double precision, rough_rank double precision, cover_rank double precision, p_ret double precision, p_exp double precision, n_ret double precision, n_exp double precision, native_veg integer, lulc_veg integer, macro_region text, "default" text, id integer, intake_id integer, study_case_id integer, user_id integer) 
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE 
    ROWS 1000
AS $function$
BEGIN
		return query select *
			from waterproof_parameters_biophysical param WHERE param.user_id=1000 AND param.macro_region=macro_value AND param.default=default_value;	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wpget_paths_climate_value(study_cases_id integer)
 RETURNS TABLE(id_path_parameter integer, id_basin integer, path varchar, id_parameter integer)
 LANGUAGE plpgsql
AS $function$
BEGIN		
		return query select p.id_parametro_ruta, p.id_basin, p.ruta, p.id_parametro from public.waterproof_pr_parametro_ruta p where id_parametro in (
						select id_tipo_parametro  from public.waterproof_pr_parametro where nombre like  '%' ||  (select c.name 
							from public.waterproof_study_cases_studycases s
							left join public.waterproof_parameters_climate_value c
							on s.climate_scenario_id  = c.id
							where s.id = study_cases_id and s.climate_scenario_id  is not null))
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_invest_result_insert
(year integer, model_type character varying, awy double precision , wn_kg double precision , wp_kg double precision , wsed_ton double precision , 
bf_m3 double precision , wc_ton double precision , intake_id integer , study_case_id integer , user_id integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN				
	INSERT INTO public.waterproof_reports_invest_results
	("year", "type", awy, wn_kg, wp_kg, wsed_ton, bf_m3, wc_ton, execution_date, intake_id, study_case_id, user_id)
	VALUES(year, model_type, awy , wn_kg, wp_kg, wsed_ton, bf_m3, wc_ton, current_date, intake_id, study_case_id, user_id);
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_get_function_cost_study_cases(casestudyid integer)
 RETURNS TABLE("yearA" integer, elementa integer, currencymoneycosta character varying, global_multiplier_factora numeric, stagea character varying, awya double precision, q_l_sa double precision, cn_mg_la double precision, cp_mg_la double precision, csed_mg_la double precision, wn_kga double precision, wp_kga double precision, wsed_tona double precision, wn_ret_kga double precision, wp_ret_tona double precision, wsed_ret_tona double precision, functioncosa character varying, graphida integer)
 LANGUAGE plpgsql
AS $function$
Begin
	return query 
			select  distinct "year","element",coB.currency as currencyMoneyCost,co.global_multiplier_factor,stage,
			wi.awy,wi.q_l_s,wi.cn_mg_l,wi.cp_mg_l,wi.csed_mg_l,
			wi.wn_kg,wi.wp_kg,wi.wsed_ton,wi.wn_ret_kg,wi.wp_ret_ton,wi.wsed_ret_ton, ucf."function", elt."graphId" 
			from public.waterproof_reports_wbintake wi left join public.waterproof_intake_usercostfunctions ucf 
			on (wi.water_intake=ucf.intake_id and wi."element"=ucf.element_system_id)
			left join public.waterproof_study_cases_studycases sc on (wi.studycase_id=sc.id)
			left join public.waterproof_parameters_cities ci on (sc.city_id=ci.id) 
			left join public.waterproof_parameters_countries co on (ci.country_id =co.id)
			left join public.waterproof_parameters_countries coB on (ucf.currency_id=coB.id)
			left join public.waterproof_intake_elementsystem elt on (wi."element"=elt.id)
			where studycase_id =caseStudyId 
			order by "year";
end;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_get_aggregate_result_function_cost(varstage character varying, varintake_id_plant_id integer, varelement_id integer, varyear integer, varvalue_calculate double precision, varcurrency_function character varying, varstudy_case_id integer, varuser_id integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
	insert into public.waterproof_reports_result_cost_function 
	(stage,intake_id_plant_id,element_id,"year",value_calculate,currency_function,date_excution,study_case_id,user_id)
	values (varstage,varintake_id_plant_id,varelement_id,varyear,varvalue_calculate,varcurrency_function,now(),varstudy_case_id,varuser_id);
	
end;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_cost(studycase integer, type_in character varying, stages character varying)
 RETURNS TABLE(process_o integer, year_o integer, value_o double precision, function_o bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
  return query 
	select distinct 
		element_id as process,
		year,
		value_calculate,
		function_id
		from
		waterproof_reports_result_cost_function 
	where study_case_id = studycase 
		and type_desc = type_in
		and stage = stages
		and year>0
	order by year, element_id;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_financial_parameters_first(studycase integer)
 RETURNS TABLE(costs character varying, values_out numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
  return query 
   select
   t1.cost,
   t1.value
   from
	(select
		cost,
		value,
	 	studycase_id
		from
		studycase_currency_costs_calculated_dani
		where type_or_id='Carbon' or type_or_id='Financial' and studycase_id = studycase) as t1
	where t1.studycase_id = studycase;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_financial_parameters_second(studycase integer)
 RETURNS TABLE(cost numeric, rate numeric, rate_min numeric, rate_max numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
  return query 
	select
		transaction_cost,
		discount_rate,
		discount_rate_minimunm,
		discount_rate_maximum
		from
		waterproof_study_cases_studycases
		where id=studycase;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_insert_cost(currency_in character varying, serie_time_in bigint, value_in double precision, studycase bigint, cost_id_in character varying, date_in date, type_in character varying, vpn_min_cost_in double precision, vpm_max_cost_in double precision, vpn_med_cost_in double precision)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN				
		INSERT INTO waterproof_reports_analysis_costs (
			currency, time, value, study_case_id, cost_id, date_create, type, vpn_min_cost, vpm_max_cost, vpn_med_cost) 
			VALUES (currency_in, serie_time_in, value_in, studycase, cost_id_in, date_in, type_in,vpn_min_cost_in, vpm_max_cost_in, vpn_med_cost_in);
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_insert_save(currency_in character varying, serie_time_in bigint, value_in double precision, element_id_in integer, studycase integer, date_in date, type_in character varying, vpn_min_cost_in double precision, vpm_max_cost_in double precision, vpn_med_cost_in double precision)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN				
		INSERT INTO waterproof_reports_analysis_benefits (
			currency, time, benefit_value, element_id, study_case_id, creation_date, type_id, vpn_min_benefit, vpn_max_benefit, vpn_med_benefit ) 
			VALUES (currency_in, serie_time_in, value_in, element_id_in, studycase, date_in, type_in,vpn_min_cost_in, vpm_max_cost_in, vpn_med_cost_in);
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_insert_sensitivity(currency_in character varying, total double precision, roi_w_dis double precision, roi_min double precision, roi_med double precision, studycase bigint, date_in date)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN				
		INSERT INTO waterproof_report_result_roi (
			currency,roi_without_discount, roi_minimum, roi_maximum, roi_medium, study_case_id,create_date ) 
			VALUES (currency_in,total,roi_w_dis,roi_min, roi_med,studycase, date_in);
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_insert_vpn(currency_in character varying, implemen_in double precision, main_in double precision, opor_in double precision, trans_in double precision, plat_in double precision, benet_in double precision, total_in double precision, studycase bigint, date_in date)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN				
		INSERT INTO waterproof_reports_vpn (
			currency,implementation,maintenance,oportunity,transaction,platform,benefit,total,study_case_id,date_execution ) 
			VALUES (currency_in,implemen_in,main_in,opor_in,trans_in,plat_in,benet_in,total_in,studycase, date_in);
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_nbs_cost(studycase integer)
 RETURNS TABLE(ids character varying, periodicity integer, costs character varying, values_out numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
  return query 
	select
        coc.type_or_id,
        nbsca.periodicity_maitenance,
        coc.cost,
        coc.value
    from
        waterproof_study_cases_studycases_nbs nbs
        join waterproof_nbs_ca_waterproofnbsca nbsca ON nbs.nbs_id = nbsca.id
        join studycase_currency_costs_calculated_dani coc ON coc.type_or_id = cast(nbsca.id AS character varying)
    where coc.studycase_id=nbs.studycase_id and coc.studycase_id=studycase
    order by coc.type_or_id asc;
	
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_tc_carbon(studycase integer)
 RETURNS TABLE(currency character varying, valor numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
  return query 
	select
		case
			when 
				benefit_carbon_market is true 
			then
				cm_currency
			else null
		end as currency,
		case
			when 
				benefit_carbon_market is true 
			then
				cm_value
			else null
		end as value
	from
	waterproof_study_cases_studycases 
	where id=studycase;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_tc_cost_nbs(studycase integer)
 RETURNS TABLE(id_nbs integer, unit_implementation_cost numeric, unit_maintenance_cost numeric, unit_oportunity_cost numeric, currency character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN
  return query 
	select
	nbs.nbs_id,
	nbsca.unit_implementation_cost,
	nbsca.unit_maintenance_cost,
	nbsca.unit_oportunity_cost,
	countries.currency
	from
	waterproof_study_cases_studycases cases
	join waterproof_study_cases_studycases_nbs nbs ON cases.id = nbs.studycase_id
	join waterproof_nbs_ca_waterproofnbsca nbsca ON nbs.nbs_id = nbsca.id
	join waterproof_parameters_countries countries ON nbsca.currency_id = countries.id
	where cases.id=studycase;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_tc_exchange_rate(studycase integer)
 RETURNS TABLE(analysis_currency character varying, currency character varying, valor numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
  return query 
	select
	cases.analysis_currency,
	curren.currency,
	curren.value
	from
	waterproof_study_cases_studycases cases
	join waterproof_study_cases_studycases_currency curren ON cases.id = curren.studycase_id
	where cases.id=studycase;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_tc_financial_param(studycase integer)
 RETURNS TABLE(currency character varying, director numeric, monitoring_man numeric, finance_man numeric, imp_man numeric, office_cost numeric, travel_in numeric, equip_purch numeric, contract numeric, overhe numeric, othe numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
  return query 
	select 
	financial_currency,
	"program_Director",
	"monitoring_Manager",
	"finance_Manager",
	"implementation_Manager",
	"office_Costs",
	travel,
	"equipment_Purchased",
	contracts,
	overhead,
	others
	from
	waterproof_study_cases_studycases
	where id=studycase;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_tc_global_multi_factor(studycase integer)
 RETURNS TABLE(global_multi_factor numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
  return query 
	select 
		global_multiplier_factor 
		from
		waterproof_study_cases_studycases cases
		join waterproof_parameters_cities cities on cases.City_id = cities.id
		join waterproof_parameters_countries country on cities.country_id = country.id
		where cases.id = studycase;
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_tc_insert(type_in character varying, cost_in character varying, value_in numeric, currency_in character varying, studycase_in integer, date_exec date)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN				
	INSERT INTO public.studycase_currency_costs_calculated_dani(type_or_id,cost,value,currency,studycase_id,date_execution)
	VALUES(type_in,cost_in,value_in,currency_in,studycase_in,date_exec);
    END;
$function$
;

CREATE OR REPLACE FUNCTION public.__wp_roi_time(studycase integer)
 RETURNS TABLE(timeres integer, imple integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  return query 
	select 
	analysis_period_value,
	time_implement
	from waterproof_study_cases_studycases 
	where id = studycase;
    END;
$function$
;


