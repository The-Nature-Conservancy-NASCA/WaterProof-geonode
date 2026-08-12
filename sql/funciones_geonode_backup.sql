CREATE FUNCTION public.__ejemplo() RETURNS integer
    LANGUAGE plpgsql
    AS $$
declare
	multiplerK integer;
	a1 Constant integer := 1000;
	resultado integer;
begin
	multiplerK :=365*24*3600;
	resultado := a1 / multiplerK;
	return resultado;
/*
	with Ntb ("year","element",currencyMoneyCost,global_multiplier_factor,stage,
			awy,q_l_s,cn_mg_l,cp_mg_l,csed_mg_l,
			wn_kg,wp_kg,wsed_ton,wn_ret_kg,wp_ret_ton,wsed_ret_ton, "function", "graphId",
			type_desc, funcion_id,intake_id ) as 
			(select  distinct "year","element",coB.currency as currencyMoneyCost,co.global_multiplier_factor::float,stage,
			wi.awy,wi.q_l_s,wi.cn_mg_l,wi.cp_mg_l,wi.csed_mg_l,
			wi.wn_kg,wi.wp_kg,wi.wsed_ton,wi.wn_ret_kg,wi.wp_ret_ton,wi.wsed_ret_ton, ucf."function", elt."graphId",
			'intake' as type_desc, ucf.id as funcion_id,ucf.intake_id as intake_ptap_id
			from public.waterproof_reports_wbintake wi left join public.waterproof_intake_usercostfunctions ucf 
			on (wi.water_intake=ucf.intake_id and wi."element"=ucf.element_system_id)
			left join public.waterproof_study_cases_studycases sc on (wi.studycase_id=sc.id)
			left join public.waterproof_parameters_cities ci on (sc.city_id=ci.id) 
			left join public.waterproof_parameters_countries co on (ci.country_id =co.id)
			left join public.waterproof_parameters_countries coB on (ucf.currency_id=coB.id)
			left join public.waterproof_intake_elementsystem elt on (wi."element"=elt.id)
			where studycase_id = caseStudyId and ucf."function" not in ('NO EXISTE') and stage=varStage
			union
			select distinct wp."year",wp.element_id,case when f.function_currency is null then 'N/A' else f.function_currency end,case when f.function_factor::float is null then 0 else f.function_factor::float end,
						wp.stage,wp.awy,wp.awy as q_l_s,wp.cn_mg_l,wp.cp_mg_l,wp.csed_mg_l,
						wp.wn_kg,wp.wp_kg,wp.wsed_ton,wp.wn_ret_kg,wp.wp_ret_kg,wp.wsed_ret_ton,
						f.function_value,e.element_graph_id,'PTAP' as type_desc, f.id as funcion_id, wp.ptap_id as intake_ptap_id 
			from public.waterproof_treatment_plants_element e
			left join public.waterproof_treatment_plants_function f 
			on (e.element_graph_id=f.function_graph_id and e.element_plant_id=f.function_plant_id)
			left join public.waterproof_reports_wbptap wp
			on (e.id=wp.element_id and e.element_plant_id=wp.ptap_id)
			inner join public.waterproof_study_cases_studycases_ptaps pt 
			on (e.element_plant_id=pt.header_id)
			where pt.studycases_id=caseStudyId and stage=varStage)		
	
		select * from Ntb  where type_desc=varTypeDesca;
*/		
end;
$$;


--
-- Name: __get_caracteristics_cs_intake_pdf(integer); Type: FUNCTION; Schema: public; Owner: -
--
--
CREATE FUNCTION public.__get_caracteristics_cs_intake_pdf(varstudycase integer) RETURNS TABLE(namea character varying, descripcionindicadorfa text, intakeid integer)
    LANGUAGE plpgsql
    AS $$
begin
	return query				
		select i."name",replace(es."name",'"','') as "CaracteristicasDelSistema",
		i.id as intakeId
		from public.waterproof_intake_intake i inner join public.waterproof_intake_elementsystem es 
		on i.id =es.intake_id inner join 
		public.waterproof_intake_elementconnections ec on (es.id=source_id)  inner join
		public.waterproof_study_cases_studycases_intakes cs on (cs.intake_id=i.id)
		where cs.studycases_id = varstudycase
		order by ec.id; 
end;
$$;


--
-- Name: __get_caracteristics_ptap_detail_pdf(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_caracteristics_ptap_detail_pdf(varstudycase integer) RETURNS TABLE(namea character varying, descripcionindicadorfa character varying, graph_id integer, planid integer, isused boolean)
    LANGUAGE plpgsql
    AS $$
begin
	return query						
			select distinct ph.plant_name, case when pef.unitary_process is null 
			then pe.element_normalize_category else pef.unitary_process end as element_normalize_category,
			pe.element_graph_id,
			ph.id as PlanID,pe.element_on_off as isUsed
			from public.waterproof_study_cases_studycases_ptaps cs inner join 
			public.waterproof_treatment_plants_element pe on (cs.header_id=pe.element_plant_id) inner join
			public.waterproof_treatment_plants_header ph on (pe.element_plant_id=ph.id) left join
			waterproof_intake_processefficiencies pef on (pe.element_normalize_category=pef.normalized_category)
			where cs.studycases_id = varstudycase
			order by ph.plant_name,pe.element_graph_id asc;			
end;
$$;


--
-- Name: __get_caracteristics_ptap_intake_pdf(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_caracteristics_ptap_intake_pdf(varstudycase integer) RETURNS TABLE(namea character varying, descripcionindicadorfa character varying)
    LANGUAGE plpgsql
    AS $$
begin
	return query				
			select ph.plant_name,ii."name" 
			from public.waterproof_study_cases_studycases_ptaps cs inner join 
			public.waterproof_treatment_plants_header ph on (cs.header_id=ph.id) left join 
			public.waterproof_treatment_plants_csinfra pci on (ph.id=pci.csinfra_plant_id) inner join
			public.waterproof_intake_elementsystem ies on (pci.csinfra_elementsystem_id=ies.id) inner join 
			public.waterproof_intake_intake ii on (ies.intake_id=ii.id)
			where cs.studycases_id = varstudycase; 
end;
$$;


--
-- Name: __get_conservation_activities_pdf(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_conservation_activities_pdf(varstudycase integer) RETURNS TABLE(namea character varying, descripcionindicadorfa character varying, max_benefit_req_timea numeric, unit_implementation_costa numeric, unit_maintenance_costa numeric, periodicity_maitenance integer, unit_oportunity_cost numeric, profit_pct_time numeric)
    LANGUAGE plpgsql
    AS $$
begin
	return query				
		select nbs."name",nbs.description,nbs.max_benefit_req_time,
		nbs.unit_implementation_cost, nbs.unit_maintenance_cost, nbs.periodicity_maitenance,
		nbs.unit_oportunity_cost, nbs.profit_pct_time_inter_assoc
		from public.waterproof_nbs_ca_waterproofnbsca nbs inner join 
		public.waterproof_study_cases_studycases_nbs csn on (nbs.id=csn.nbs_id)
		where csn.studycase_id = varstudycase; 
end;
$$;


--
-- Name: __get_financial_analysis_pdf_runanalisis_pdf(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_financial_analysis_pdf_runanalisis_pdf(varstudycase integer) RETURNS TABLE(platfromcostyeara numeric, discount_ratea numeric, discount_rate_minimunma numeric, discount_rate_maximuma numeric, runanalysisfullporfolioimplementationa integer, runanalysisfullroia integer, runanalysisfullescenarioa character varying, transaction_costa numeric)
    LANGUAGE plpgsql
    AS $$
begin
	return query				
			--Financial_analysis_pdf_runAnalisis_pdf
			select nullif("program_Director",0) + nullif("implementation_Manager",0) + nullif("monitoring_Manager",0)
			+ nullif("finance_Manager",0) + nullif("office_Costs",0)+
			nullif(overhead,0) + nullif("equipment_Purchased",0) as PlatfromCostYear, discount_rate, 
			discount_rate_minimunm,
			discount_rate_maximum,
			time_implement as RunAnalysisFullPorfolioImplementation,
			analysis_period_value as RunAnalysisFullROI,
			cv."name" as RunAnalysisFullEscenario,
			nullif(transaction_cost,0) as  transaction_cost
			from public.waterproof_study_cases_studycases cs inner join
			public.waterproof_parameters_climate_value cv on (cs.climate_scenario_id=cv.id) 
			where cs.id = varstudycase; 
end;
$$;


--
-- Name: __get_objetives_for_porfolios_pdf(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_objetives_for_porfolios_pdf(varstudycase integer) RETURNS TABLE(namea character varying)
    LANGUAGE plpgsql
    AS $$
begin
	return query				
		select cp."name" 
		from public.waterproof_study_cases_studycases cs inner join 
		public.waterproof_study_cases_studycases_portfolios csp on (cs.id=csp.studycases_id)
		inner join public.waterproof_study_cases_portfolio cp on (csp.portfolio_id=cp.id)
		where cs.id = varstudycase; 
end;
$$;


--
-- Name: __get_report_analisys_benefics(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_analisys_benefics(varstudycase integer) RETURNS TABLE(descripcionindicadorf character varying, valorpromediof bigint, colorf text, descriptionf character varying, intake_id integer)
    LANGUAGE plpgsql
    AS $$
begin
	return query				
		with IncatorAque (casoEstudio,descripcionIndicador,valorPromedio,color,intakeId)	
			as 
			(select 
				sc.id,
				aqueduct_indicators,
				(sum(value_ind)/count(value_ind))::int as valuerr,
				case when (sum(value_ind)/count(value_ind)) <=1 then 'Dark Green'
				when (sum(value_ind)/count(value_ind)) >1 and (sum(value_ind)/count(value_ind)) <2 then 'Orange'
				when (sum(value_ind)/count(value_ind)) >=2 and (sum(value_ind)/count(value_ind))  <3 then 'Orange' 
				when (sum(value_ind)/count(value_ind)) >=3 and (sum(value_ind)/count(value_ind))  <4 then 'Dark Red' 
				when (sum(value_ind)/count(value_ind)) >=4 then 'Dark Red' 
				end as RED_A,
				si.intake_id
			from 
			public.waterproof_study_cases_studycases sc
			inner join public.waterproof_study_cases_studycases_intakes si on (sc.id=si.studycases_id)
			inner join public.waterproof_reports_aqueduct ra on (si.intake_id=ra.intake_id)
			where sc.id = varStudyCase and aqueduct_indicators not like '%Futu%'
			group by 1,2,5
			union
			select 
				sc.id,
				aqueduct_indicators,
				(sum(value_ind)/count(value_ind))::int as valuerr,
				case when (sum(value_ind)/count(value_ind)) <=1 then 'Dark Green'
				when (sum(value_ind)/count(value_ind)) >1 and (sum(value_ind)/count(value_ind)) <2 then 'Orange'
				when (sum(value_ind)/count(value_ind)) >=2 and (sum(value_ind)/count(value_ind))  <3 then 'Orange' 
				when (sum(value_ind)/count(value_ind)) >=3 and (sum(value_ind)/count(value_ind))  <4 then 'Dark Red' 
				when (sum(value_ind)/count(value_ind)) >=4 then 'Dark Red' 
				end as RED_A,
				inelsys.intake_id
			from 
			public.waterproof_study_cases_studycases sc
			inner join public.waterproof_study_cases_studycases_ptaps stpt on (sc.id=stpt.studycases_id)
			inner join public.waterproof_treatment_plants_ptap tpp on (stpt.header_id=tpp.ptap_plant_id)
			inner join public.waterproof_treatment_plants_csinfra tpcs on (tpp.ptap_plant_id=tpcs.csinfra_plant_id)
			inner join public.waterproof_intake_elementsystem inelsys on (tpcs.csinfra_elementsystem_id=inelsys.id)
			inner join public.waterproof_reports_aqueduct ra on (inelsys.intake_id=ra.intake_id)
			where sc.id = varStudyCase and aqueduct_indicators not like '%Futu%'
			group by 1,2,5),IncatorA2(casoEstudio,descripcionIndicador,valorPromedio,color,intakeId)
				as 
				( select
						casoEstudio,
						'Overall water risk score',
						(sum(valorPromedio)/count(valorPromedio)) as valueAne,
						case when (sum(valorPromedio)/count(valorPromedio)) <=1 then 'Dark Green'
--
CREATE FUNCTION public.__get_report_analisys_benefics_fastflood(varstudycase integer) RETURNS TABLE(descripcionindicadorf character varying, valorpromediof bigint, colorf text, descriptionf character varying, intake_id integer)
    LANGUAGE plpgsql
    AS $$
begin
	return query				
		with IncatorAque (casoEstudio,descripcionIndicador,valorPromedio,color,intakeId)	
			as 
			(select 
				sc.id,
				aqueduct_indicators,
				(sum(value_ind)/count(value_ind))::int as valuerr,
				case when (sum(value_ind)/count(value_ind)) <=1 then 'Dark Green'
				when (sum(value_ind)/count(value_ind)) >1 and (sum(value_ind)/count(value_ind)) <2 then 'Orange'
				when (sum(value_ind)/count(value_ind)) >=2 and (sum(value_ind)/count(value_ind))  <3 then 'Orange' 
				when (sum(value_ind)/count(value_ind)) >=3 and (sum(value_ind)/count(value_ind))  <4 then 'Dark Red' 
				when (sum(value_ind)/count(value_ind)) >=4 then 'Dark Red' 
				end as RED_A,
				si.watershed_id
			from 
			public.waterproof_fastflood_studycases sc
			inner join public.waterproof_fastflood_studycases_watershed si on (sc.id=si.studycases_id)
			inner join public.waterproof_reports_aqueduct_fastflood ra on (si.watershed_id=ra.intake_id)
			where sc.id = varStudyCase and aqueduct_indicators not like '%Futu%'
			group by 1,2,5
			),IncatorA2(casoEstudio,descripcionIndicador,valorPromedio,color,intakeId)
				as 
				( select
						casoEstudio,
						'Overall water risk score',
						(sum(valorPromedio)/count(valorPromedio)) as valueAne,
						case when (sum(valorPromedio)/count(valorPromedio)) <=1 then 'Dark Green'
						when (sum(valorPromedio)/count(valorPromedio)) >1 and (sum(valorPromedio)/count(valorPromedio)) <2 then 'Orange'
						when (sum(valorPromedio)/count(valorPromedio)) >=2 and (sum(valorPromedio)/count(valorPromedio))  <3 then 'Orange' 
						when (sum(valorPromedio)/count(valorPromedio)) >=3 and (sum(valorPromedio)/count(valorPromedio))  <4 then 'Dark Red' 
						when (sum(valorPromedio)/count(valorPromedio)) >=4 then 'Dark Red' 
						end as RED_A,
						intakeId
					from 
				  	IncatorAque
				  	group by 1,2,5
				)
			
			select descripcionindicador,valorpromedio::INT,color,ads.description,ia.intakeId 
			from IncatorAque ia inner join	public.waterproof_reports_aqueduct_desc_state ads 
			on (ia.valorPromedio = ads.valuer)
			union all
			select descripcionindicador,valorpromedio,color,description,ia.intakeId
			from IncatorA2 ia left join	public.waterproof_reports_aqueduct_desc_state ads 
			on (ia.valorPromedio = ads.valuer)
			order by 5;
						
--
CREATE FUNCTION public.__get_report_analisys_beneficsb(varstudycase integer) RETURNS TABLE(changeinvolumeofwateryiekdf double precision, changeinbaseflowf double precision, changeintotalsedimentsf double precision, changeinnitrogenloadf double precision, changeinphosphorusf double precision, changeincarbonstoragef double precision, timer integer, analysis_currencyr character varying, roir double precision, resulttr text, transaction_costa numeric)
    LANGUAGE plpgsql
    AS $$
begin
return query 
select max(ind.awy) as ChangeInVolumeOfWaterYiekd,max(ind.bf_m3) as ChangeInBaseFlow,
min(ind.wsed_ton) as ChangeInTotalSediments, min(ind.wn_kg) as ChangeInNitrogenLoad,
min(ind.wp_kg) as ChangeInPhosphorus, max(ind.wc_ton) as ChangeInCarbonStorage
,max(ind."time") as "time", min(cst.analysis_currency)::VARCHAR,
min(r.roi_medium) as ROI,
case when min(r.roi_medium)<1 then 'Low::Dark Red'
when min(r.roi_medium)>=1 and min(r.roi_medium)<=2 then 'High::Light Green'
when min(r.roi_medium)>2 then 'Very high::Dark Green' end as ResultT,
cst.discount_rate
from public.waterproof_study_cases_studycases cst left join 
public.waterproof_reports_investindicators ind  on (ind.study_case_id=cst.id) left join
public.waterproof_report_result_roi r on (cst.id=r.study_case_id)
where ind."type" = 'Total_ind' and ind.study_case_id = varstudycase and ind."time" <> 0
group by ind.study_case_id,cst.discount_rate;
end;
$$;


--
-- Name: __get_report_analisys_beneficsb_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_analisys_beneficsb_fastflood(varstudycase integer) RETURNS TABLE(changeinvolumeofwateryiekdf double precision, changeinbaseflowf double precision, changeintotalsedimentsf double precision, changeinnitrogenloadf double precision, changeinphosphorusf double precision, changeincarbonstoragef double precision, timer integer, analysis_currencyr character varying, roir double precision, resulttr text, transaction_costa numeric)
    LANGUAGE plpgsql
    AS $$
begin
return query 
select max(ind.awy) as ChangeInVolumeOfWaterYiekd,max(ind.bf_m3) as ChangeInBaseFlow,
min(ind.wsed_ton) as ChangeInTotalSediments, min(ind.wn_kg) as ChangeInNitrogenLoad,
min(ind.wp_kg) as ChangeInPhosphorus, max(ind.wc_ton) as ChangeInCarbonStorage
,max(ind."time") as "time", min(cst.analysis_currency)::VARCHAR,
min(r.roi_medium) as ROI,
case when min(r.roi_medium)<1 then 'Low::Dark Red'
when min(r.roi_medium)>=1 and min(r.roi_medium)<=2 then 'High::Light Green'
when min(r.roi_medium)>2 then 'Very high::Dark Green' end as ResultT,
cst.discount_rate
from public.waterproof_fastflood_studycases cst left join 
public.waterproof_reports_investindicators_fastflood ind  on (ind.study_case_id=cst.id) left join
public.waterproof_report_result_roi_fastflood r on (cst.id=r.study_case_id)
where ind."type" = 'Total_ind' and ind.study_case_id = varstudycase and ind."time" <> 0
group by ind.study_case_id,cst.discount_rate;
end;
$$;


--
-- Name: __get_report_analisys_beneficsc(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_analisys_beneficsc(varstudycase integer) RETURNS TABLE(sbnf character varying, costperhectaref double precision, recommendedinterventionf double precision, intake_idf integer, namea character varying)
    LANGUAGE plpgsql
    AS $$
begin
return query 

select nbs.name as sbn, round(cast(sum(actual_spent) as numeric),2):: double precision as CostPerHectare,
round(cast(Sum(area_converted_ha) as numeric),2):: double precision as RecommendedIntervention,
intake_id, ii."name" 
from public.waterproof_reports_rios_ipa  inner join public.waterproof_intake_intake ii on (intake_id=ii.id)
inner join public.waterproof_nbs_ca_waterproofnbsca nbs on (sbn = nbs.slug)
where study_case_id=varstudycase and "year"<>9999 and sbn not like ('%Tot%') and sbn not like ('%Floating Budget%') 
group by 1,4,5
order by 4,1; 

end;
$$;


--
-- Name: __get_report_analisys_beneficsc_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_analisys_beneficsc_fastflood(varstudycase integer) RETURNS TABLE(sbnf character varying, costperhectaref double precision, recommendedinterventionf double precision, intake_idf integer, namea character varying)
    LANGUAGE plpgsql
    AS $$
begin
return query 

select nbs.name as sbn, round(cast(sum(actual_spent) as numeric),2):: double precision as CostPerHectare,
round(cast(Sum(area_converted_ha) as numeric),2):: double precision as RecommendedIntervention,
intake_id, ii."name" 
from public.waterproof_reports_rios_ipa_fastflood  inner join public.waterproof_fastflood_watershed ii on (intake_id=ii.id)
inner join public.waterproof_nbs_ca_waterproofnbsca nbs on (sbn = nbs.slug)
where study_case_id=varstudycase and "year"<>9999 and sbn not like ('%Tot%') and sbn not like ('%Floating Budget%') 
group by 1,4,5
order by 4,1; 

end;
$$;


--
-- Name: __get_report_analisys_sensitivy_benefits(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_analisys_sensitivy_benefits(varsstudycaseid integer) RETURNS TABLE(timer bigint, totalminbenefitr numeric, totalmedbenefitr numeric, totalmaxbenefitr numeric)
    LANGUAGE plpgsql
    AS $$
begin
	return query 
			select "time",sum(vpn_min_benefit)::numeric as totalMinBenefit,sum(vpn_med_benefit)::numeric as totalMedBenefit, 
			sum(vpn_max_benefit)::numeric as totalMaxBenefit		
			from public.waterproof_reports_analysis_benefits
			where study_case_id=varSstudyCaseId
			group by 1
			order by 1;
end;
$$;


--
-- Name: __get_report_analisys_sensitivy_benefits_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_analisys_sensitivy_benefits_fastflood(varsstudycaseid integer) RETURNS TABLE(timer bigint, totalminbenefitr numeric, totalmedbenefitr numeric, totalmaxbenefitr numeric)
    LANGUAGE plpgsql
    AS $$
begin
	return query 
			select "time",sum(vpn_min_benefit)::numeric as totalMinBenefit,sum(vpn_med_benefit)::numeric as totalMedBenefit, 
			sum(vpn_max_benefit)::numeric as totalMaxBenefit		
			from public.waterproof_reports_analysis_benefits_fastflood
			where study_case_id=varSstudyCaseId
			group by 1
			order by 1;
end;
$$;


--
-- Name: __get_report_analisys_sensitivy_cost(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_analisys_sensitivy_cost(varsstudycaseid integer) RETURNS TABLE(timer bigint, totalmincostr numeric, totalmedcostr numeric, totalmaxcostr numeric)
    LANGUAGE plpgsql
    AS $$
begin
	return query 
			select "time",round(sum(vpn_min_cost)::numeric,2) as totalMinCost,round(sum(vpn_med_cost)::numeric,2) as totalMedCost,
			round(sum(vpm_max_cost)::numeric,2) as totalMaxCost
			from public.waterproof_reports_analysis_costs
			where study_case_id=varSstudyCaseId
			group by 1
			order by 1;
end;
$$;


--
-- Name: __get_report_analisys_sensitivy_cost_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_analisys_sensitivy_cost_fastflood(varsstudycaseid integer) RETURNS TABLE(timer bigint, totalmincostr numeric, totalmedcostr numeric, totalmaxcostr numeric)
    LANGUAGE plpgsql
    AS $$
begin
	return query 
			select "time",round(sum(vpn_min_cost)::numeric,2) as totalMinCost,round(sum(vpn_med_cost)::numeric,2) as totalMedCost,
			round(sum(vpm_max_cost)::numeric,2) as totalMaxCost
			from public.waterproof_reports_analysis_costs_fastflood
			where study_case_id=varSstudyCaseId
			group by 1
			order by 1;
end;
$$;


--
-- Name: __get_report_analysis_benefits_filter(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_analysis_benefits_filter(varstudycases integer) RETURNS TABLE(typer character varying, timer bigint, namer character varying, normalized_categoryr character varying, benefit_valuer double precision, vpn_med_benefitr double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
return query 
select distinct a.type_id,a."time",b."name",pe.unitary_process,round(cast(sum(distinct a.benefit_value) as numeric),2)::double precision as benefit_value,round(cast(sum(distinct a.vpn_med_benefit) as numeric),2)::double precision as vpn_med_benefit 
from waterproof_reports_analysis_benefits a left join public.waterproof_intake_elementsystem c on (a.element_id=c.id)
left join public.waterproof_intake_intake b on (c.intake_id=b.id) inner join
public.waterproof_intake_processefficiencies pe on (c.normalized_category=pe.normalized_category)
where a.study_case_id=varstudycases and a.type_id='INTAKE'
group by 1,2,3,4
union 
select distinct 'DWTP',a."time",b.plant_name,pe.unitary_process ,round(cast(sum(distinct a.benefit_value) as numeric),2)::double precision as benefit_value,round(cast(sum(distinct a.vpn_med_benefit) as numeric),2)::double precision as vpn_med_benefit 
from public.waterproof_reports_analysis_benefits a left join public.waterproof_treatment_plants_element c on (a.element_id=c.id)
left join public.waterproof_treatment_plants_header b on (c.element_plant_id=b.id) inner join
public.waterproof_intake_processefficiencies pe on (c.element_normalize_category=pe.normalized_category)
where a.study_case_id=varstudycases and a.type_id='PTAP'
group by 1,2,3,4
union 
select distinct a.type_id,a."time",'CARBON','CARBON',round(cast(sum(distinct a.benefit_value) as numeric),2)::double precision as benefit_value,round(cast(sum(distinct a.vpn_med_benefit) as numeric),2)::double precision as vpn_med_benefit 
from public.waterproof_reports_analysis_benefits a 
where a.study_case_id=varstudycases and a.type_id='CARBONO'
group by 1,2,3,4
order by 1,2,3,4;
END;
$$;


--
-- Name: __get_report_analysis_benefits_filter_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_analysis_benefits_filter_fastflood(varstudycases integer) RETURNS TABLE(typer character varying, timer bigint, namer character varying, normalized_categoryr character varying, benefit_valuer double precision, vpn_med_benefitr double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
return query 
select distinct a.type_id,a."time",b."name",pe.unitary_process,round(cast(sum(distinct a.benefit_value) as numeric),2)::double precision as benefit_value,round(cast(sum(distinct a.vpn_med_benefit) as numeric),2)::double precision as vpn_med_benefit 
from waterproof_reports_analysis_benefits_fastflood a left join public.waterproof_intake_elementsystem c on (a.element_id=c.id)
left join public.waterproof_intake_intake b on (c.intake_id=b.id) inner join
public.waterproof_intake_processefficiencies pe on (c.normalized_category=pe.normalized_category)
where a.study_case_id=varstudycases and a.type_id='INTAKE'
group by 1,2,3,4
union 
select distinct 'DWTP',a."time",b.plant_name,pe.unitary_process ,round(cast(sum(distinct a.benefit_value) as numeric),2)::double precision as benefit_value,round(cast(sum(distinct a.vpn_med_benefit) as numeric),2)::double precision as vpn_med_benefit 
from public.waterproof_reports_analysis_benefits_fastflood a left join public.waterproof_treatment_plants_element c on (a.element_id=c.id)
left join public.waterproof_treatment_plants_header b on (c.element_plant_id=b.id) inner join
public.waterproof_intake_processefficiencies pe on (c.element_normalize_category=pe.normalized_category)
where a.study_case_id=varstudycases and a.type_id='PTAP'
group by 1,2,3,4
union 
select distinct a.type_id,a."time",'CARBON','CARBON',round(cast(sum(distinct a.benefit_value) as numeric),2)::double precision as benefit_value,round(cast(sum(distinct a.vpn_med_benefit) as numeric),2)::double precision as vpn_med_benefit 
from public.waterproof_reports_analysis_benefits_fastflood a 
where a.study_case_id=varstudycases and a.type_id='CARBONO'
group by 1,2,3,4
order by 1,2,3,4;
END;
$$;


--
-- Name: __get_report_costs_analysis_filter(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_costs_analysis_filter(varstudycases integer) RETURNS TABLE(typer text, timer bigint, cost_idr character varying, value_costr double precision, minvaluescostr double precision, maxbenefitr double precision, medbenefitr double precision)
    LANGUAGE plpgsql
    AS $$
	BEGIN
			return query 
					select case when "type"='Implementación' then 'Implementation' 
								when "type"='Mantenimiento' then 'Maintenance'
								when "type"='Oportunidad' then 'Opportunity'
								when "type"='Plataforma' then 'Platform'
								when "type"='Transacción' then 'Transaction'
								when "type"='Otros' then 'Others' end as type 					
					, "time",
					case when ii."name" is null then cost_id
					else ii."name" end as "name",
					sum(value) as value_cost,
					sum(vpn_min_cost) as minValuesCost,sum(vpm_max_cost) as maxBenefit,sum(vpn_med_cost) as medBenefit
					from public.waterproof_reports_analysis_costs ac left join
					public.waterproof_nbs_ca_waterproofnbsca ii on (ac.cost_id=ii.id::varchar)
					where ac.study_case_id=varStudyCases
					group by 1,2,3
					order by 1,2,3 asc;								
END;
$$;


--
-- Name: __get_report_costs_analysis_filter_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_costs_analysis_filter_fastflood(varstudycases integer) RETURNS TABLE(typer text, timer bigint, cost_idr character varying, value_costr double precision, minvaluescostr double precision, maxbenefitr double precision, medbenefitr double precision)
    LANGUAGE plpgsql
    AS $$
	BEGIN
			return query 
					select case when "type"='Implementación' then 'Implementation' 
								when "type"='Mantenimiento' then 'Maintenance'
								when "type"='Oportunidad' then 'Opportunity'
								when "type"='Plataforma' then 'Platform'
								when "type"='Transacción' then 'Transaction'
								when "type"='Otros' then 'Others' end as type 					
					, "time",
					case when ii."name" is null then cost_id
					else ii."name" end as "name",
					sum(value) as value_cost,
					sum(vpn_min_cost) as minValuesCost,sum(vpm_max_cost) as maxBenefit,sum(vpn_med_cost) as medBenefit
					from public.waterproof_reports_analysis_costs_fastflood ac left join
					public.waterproof_nbs_ca_waterproofnbsca ii on (ac.cost_id=ii.id::varchar)
					where ac.study_case_id=varStudyCases
					group by 1,2,3
					order by 1,2,3 asc;								
END;
$$;


--
-- Name: __get_report_costs_analysis_filterbgraph(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_costs_analysis_filterbgraph(varstudycases integer) RETURNS TABLE(typer character varying, medbenefitr double precision)
    LANGUAGE plpgsql
    AS $$
	BEGIN	
			return query 		
					select 
					case when ii."name" is null then cost_id
					else ii."name" end as "name",
					round(cast(sum(vpn_med_cost) as numeric),2)::double precision as medBenefit
					from public.waterproof_reports_analysis_costs ac inner join
					public.waterproof_nbs_ca_waterproofnbsca ii on (ac.cost_id=ii.id::varchar)
					where ac.study_case_id=varstudycases
					group by 1
					order by 1 asc;				
			
	END;
$$;


--
-- Name: __get_report_costs_analysis_filterbgraph_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_costs_analysis_filterbgraph_fastflood(varstudycases integer) RETURNS TABLE(typer character varying, medbenefitr double precision)
    LANGUAGE plpgsql
    AS $$
	BEGIN	
			return query 		
					select 
					case when ii."name" is null then cost_id
					else ii."name" end as "name",
					round(cast(sum(vpn_med_cost) as numeric),2)::double precision as medBenefit
					from public.waterproof_reports_analysis_costs_fastflood ac inner join
					public.waterproof_nbs_ca_waterproofnbsca ii on (ac.cost_id=ii.id::varchar)
					where ac.study_case_id=varstudycases
					group by 1
					order by 1 asc;				
			
	END;
$$;


--
-- Name: __get_report_costs_analysis_roi(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_costs_analysis_roi(varstudycases integer) RETURNS TABLE(timer bigint, currencyr character varying, createdate date, totalbenefitsr double precision, totalcostosr double precision, totalbeneficiodescontador double precision, totalcostodescontador double precision)
    LANGUAGE plpgsql
    AS $$
	BEGIN
			return query 
						WITH beneficios as
						(select a."time" as timeb,a.currency as currencyB,a.creation_date as dateB,sum(a.benefit_value) as TotalBeneficio, sum(a.vpn_med_benefit) as TotalBeneficioDescontado 
						from public.waterproof_reports_analysis_benefits a
						where a.study_case_id=varstudycases 
						group by 1,2,3), costos as (
						select b."time" as timec,b.currency as currencyC,b.date_create as dateC,sum(b.value) as TotalCostos, sum(b.vpn_med_cost) as TotalCostoDescontado 
						from public.waterproof_reports_analysis_costs b
						where b."study_case_id"=varstudycases 
						group by 1,2,3)
						select timeb,currencyb,dateb,TotalBeneficio,TotalCostos,TotalBeneficioDescontado,TotalCostoDescontado 
						from beneficios inner join costos on (beneficios.timeb=costos.timec)
						order by timec;
	END;
$$;


--
-- Name: __get_report_costs_analysis_roi_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_costs_analysis_roi_fastflood(varstudycases integer) RETURNS TABLE(timer bigint, currencyr character varying, createdate date, totalbenefitsr double precision, totalcostosr double precision, totalbeneficiodescontador double precision, totalcostodescontador double precision)
    LANGUAGE plpgsql
    AS $$
	BEGIN
			return query 
						WITH beneficios as
						(select a."time" as timeb,a.currency as currencyB,a.creation_date as dateB,sum(a.benefit_value) as TotalBeneficio, sum(a.vpn_med_benefit) as TotalBeneficioDescontado 
						from public.waterproof_reports_analysis_benefits_fastflood a
						where a.study_case_id=varstudycases 
						group by 1,2,3), costos as (
						select b."time" as timec,b.currency as currencyC,b.date_create as dateC,sum(b.value) as TotalCostos, sum(b.vpn_med_cost) as TotalCostoDescontado 
						from public.waterproof_reports_analysis_costs_fastflood b
						where b."study_case_id"=varstudycases 
						group by 1,2,3)
						select timeb,currencyb,dateb,TotalBeneficio,TotalCostos,TotalBeneficioDescontado,TotalCostoDescontado 
						from beneficios inner join costos on (beneficios.timeb=costos.timec)
						order by timec;
	END;
$$;


--
-- Name: __get_report_graph_cost_bene(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_graph_cost_bene(varcasestudy_id integer) RETURNS TABLE(currencyr character varying, costr double precision, benefistr double precision)
    LANGUAGE plpgsql
    AS $$
begin
	return query
		SELECT distinct currency, abs("implementation"+ maintenance+oportunity+ 
		"transaction"+ platform) as sumTCoss,benefit
		FROM waterproof_reports_vpn_fastflood
		where study_case_id=varcasestudy_id;
	
end;
$$;


--
-- Name: __get_report_graph_cost_bene_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_graph_cost_bene_fastflood(varcasestudy_id integer) RETURNS TABLE(currencyr character varying, costr double precision, benefistr double precision)
    LANGUAGE plpgsql
    AS $$
begin
	return query
		SELECT distinct currency, abs("implementation"+ maintenance+oportunity+ 
		"transaction"+ platform) as sumTCoss,benefit
		FROM waterproof_reports_vpn_fastflood
		where study_case_id=varcasestudy_id;
	
end;
$$;


--
-- Name: __get_report_graph_cost_vs_benefit(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_graph_cost_vs_benefit(varsstudycaseid integer) RETURNS TABLE(totalminimumr numeric, totalmediumr numeric, totalmaximumr numeric, titler character varying, porcen_discount_rater numeric, porcen_discount_rate_minimumr numeric, porcen_discount_rate_maximumr numeric, costtransation numeric)
    LANGUAGE plpgsql
    AS $$
begin 
		
		return query
				select round(sum(a.vpn_min_cost)::numeric,2) as totalMinimun,
					round(sum(a.vpn_med_cost)::numeric,2) as totalMedium,
					round(sum(a.vpm_max_cost)::numeric,2) as totalMaximum, 
					'Costs'::varchar as Title,
					round((b.discount_rate)::numeric,2) as porcen_discount_rate,
					round((b.discount_rate_minimunm)::numeric,2) as porcen_discount_rate_minimum,
					round((b.discount_rate_maximum)::numeric,2) as porcen_discount_rate_maximum,
					round((b.transaction_cost)::numeric,2) as CostTransation			
				from public.waterproof_reports_analysis_costs a inner join waterproof_study_cases_studycases b
				on (a.study_case_id=b.id)
				where a.study_case_id=varSstudyCaseId
				group by 5,6,7,8
				union
				select round(sum(vpn_min_benefit)::numeric,2) as totalMinBenefit,
					round(sum(vpn_med_benefit)::numeric,2) as totalMedBenefit, 
					round(sum(vpn_max_benefit)::numeric,2) as totalMaxBenefit, 
					'Benefits'::varchar as Title,
					round((b.discount_rate)::numeric,2) as porcen_discount_rate,
					round((b.discount_rate_minimunm)::numeric,2) as porcen_discount_rate_minimum,
					round((b.discount_rate_maximum)::numeric,2) as porcen_discount_rate_maximum,
					round((b.transaction_cost)::numeric,2) as CostTransation		
				from public.waterproof_reports_analysis_benefits a inner join waterproof_study_cases_studycases b
				on (a.study_case_id=b.id)
				where a.study_case_id=varSstudyCaseId
				group by 5,6,7,8;

end;
$$;


--
-- Name: __get_report_graph_cost_vs_benefit_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_graph_cost_vs_benefit_fastflood(varsstudycaseid integer) RETURNS TABLE(totalminimumr numeric, totalmediumr numeric, totalmaximumr numeric, titler character varying, porcen_discount_rater numeric, porcen_discount_rate_minimumr numeric, porcen_discount_rate_maximumr numeric, costtransation numeric)
    LANGUAGE plpgsql
    AS $$
begin 
		
		return query
				select round(sum(a.vpn_min_cost)::numeric,2) as totalMinimun,
					round(sum(a.vpn_med_cost)::numeric,2) as totalMedium,
					round(sum(a.vpm_max_cost)::numeric,2) as totalMaximum, 
					'Costs'::varchar as Title,
					round((b.discount_rate)::numeric,2) as porcen_discount_rate,
					round((b.discount_rate_minimunm)::numeric,2) as porcen_discount_rate_minimum,
					round((b.discount_rate_maximum)::numeric,2) as porcen_discount_rate_maximum,
					round((b.transaction_cost)::numeric,2) as CostTransation			
				from public.waterproof_reports_analysis_costs_fastflood a inner join waterproof_fastflood_studycases b
				on (a.study_case_id=b.id)
				where a.study_case_id=varSstudyCaseId
				group by 5,6,7,8
				union
				select round(sum(vpn_min_benefit)::numeric,2) as totalMinBenefit,
					round(sum(vpn_med_benefit)::numeric,2) as totalMedBenefit, 
					round(sum(vpn_max_benefit)::numeric,2) as totalMaxBenefit, 
					'Benefits'::varchar as Title,
					round((b.discount_rate)::numeric,2) as porcen_discount_rate,
					round((b.discount_rate_minimunm)::numeric,2) as porcen_discount_rate_minimum,
					round((b.discount_rate_maximum)::numeric,2) as porcen_discount_rate_maximum,
					round((b.transaction_cost)::numeric,2) as CostTransation		
				from public.waterproof_reports_analysis_benefits_fastflood a inner join waterproof_fastflood_studycases b
				on (a.study_case_id=b.id)
				where a.study_case_id=varSstudyCaseId
				group by 5,6,7,8;

end;
$$;


--
-- Name: __get_report_graph_return_of_invest_roi(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_graph_return_of_invest_roi(varstudycaseid integer) RETURNS TABLE(roi_mediumr numeric, roi_minimumr numeric, roi_maximumr numeric, porcen_discount_rater numeric, porcen_discount_rate_minimumr numeric, porcen_discount_rate_maximumr numeric, costtransation numeric)
    LANGUAGE plpgsql
    AS $$
begin
	return query	
			select round(cast(a.roi_medium as numeric),2),
				round(a.roi_minimum::numeric,2),
				round(a.roi_maximum::numeric,2), 
				round((b.discount_rate)::numeric,2) as porcen_discount_rate,
				round((b.discount_rate_minimunm)::numeric,2) as porcen_discount_rate_minimum,
				round((b.discount_rate_maximum)::numeric,2) as porcen_discount_rate_maximum,
				round((b.transaction_cost)::numeric,2) as CostTransation
			from waterproof_report_result_roi a inner join waterproof_study_cases_studycases b
			on (a.study_case_id=b.id)
			where study_case_id = varStudyCaseId;
end;
$$;


--
-- Name: __get_report_graph_return_of_invest_roi_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_graph_return_of_invest_roi_fastflood(varstudycaseid integer) RETURNS TABLE(roi_mediumr numeric, roi_minimumr numeric, roi_maximumr numeric, porcen_discount_rater numeric, porcen_discount_rate_minimumr numeric, porcen_discount_rate_maximumr numeric, costtransation numeric)
    LANGUAGE plpgsql
    AS $$
begin
	return query	
			select round(cast(a.roi_medium as numeric),2),
				round(a.roi_minimum::numeric,2),
				round(a.roi_maximum::numeric,2), 
				round((b.discount_rate)::numeric,2) as porcen_discount_rate,
				round((b.discount_rate_minimunm)::numeric,2) as porcen_discount_rate_minimum,
				round((b.discount_rate_maximum)::numeric,2) as porcen_discount_rate_maximum,
				round((b.transaction_cost)::numeric,2) as CostTransation
			from waterproof_report_result_roi_fastflood a inner join waterproof_fastflood_studycases b
			on (a.study_case_id=b.id)
			where study_case_id = varStudyCaseId;
end;
$$;


--
-- Name: __get_report_graph_vpn(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_graph_vpn(varcasestudy_id integer) RETURNS TABLE(currencyr character varying, implementationr double precision, maintenancer double precision, oportunityr double precision, transactionr double precision, platformr double precision, benefitr double precision, totalr double precision)
    LANGUAGE plpgsql
    AS $$
begin
	return query
/*
		SELECT distinct currency, "implementation", maintenance, oportunity, 
		"transaction", platform, benefit, total
		FROM waterproof_reports_vpn
		where study_case_id=varcasestudy_id;
 */	
		 select 
			 distinct currency, round(cast("implementation" as numeric),2)::double precision as implementationT, round(cast(maintenance as numeric),2)::double precision as maintenance, 
			round(cast(oportunity as numeric),2)::double precision as oportunity, 
			round(cast("transaction" as numeric),2)::double precision as "transaction", 
			round(cast(platform as numeric),2)::double precision as platform,
			round(cast(benefit as numeric),2)::double precision as benefit, 
			round(cast(total as numeric),2)::double precision as total
		FROM waterproof_reports_vpn
		where study_case_id=varcasestudy_id;

end;
$$;


--
-- Name: __get_report_graph_vpn_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_graph_vpn_fastflood(varcasestudy_id integer) RETURNS TABLE(currencyr character varying, implementationr double precision, maintenancer double precision, oportunityr double precision, transactionr double precision, platformr double precision, benefitr double precision, totalr double precision)
    LANGUAGE plpgsql
    AS $$
begin
	return query
/*
		SELECT distinct currency, "implementation", maintenance, oportunity, 
		"transaction", platform, benefit, total
		FROM waterproof_reports_vpn
		where study_case_id=varcasestudy_id;
 */	
		 select 
			 distinct currency, round(cast("implementation" as numeric),2)::double precision as implementationT, round(cast(maintenance as numeric),2)::double precision as maintenance, 
			round(cast(oportunity as numeric),2)::double precision as oportunity, 
			round(cast("transaction" as numeric),2)::double precision as "transaction", 
			round(cast(platform as numeric),2)::double precision as platform,
			round(cast(benefit as numeric),2)::double precision as benefit, 
			round(cast(total as numeric),2)::double precision as total
		FROM waterproof_reports_vpn_fastflood
		where study_case_id=varcasestudy_id;

end;
$$;


--
-- Name: __get_report_incicator_benefist_grapha(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_incicator_benefist_grapha(varstudycase integer) RETURNS TABLE(element_normalize_categorya character varying, type_ida character varying, vpn_med_benefita double precision)
    LANGUAGE plpgsql
    AS $$
begin
	return query				
		select 
			pe.unitary_process,
			case 
				when type_id='CARBONO' then 'CARBON' 
				when type_id='PTAP' then 'DWTP' else type_id end   
			as		
			type_id, round(cast(sum(distinct vpn_med_benefit) as numeric),2)::double precision as Sumvpn_med_benefit
		from waterproof_reports_analysis_benefits bn
		inner join public.waterproof_treatment_plants_element el on (bn.element_id = el.id) inner join
		public.waterproof_intake_processefficiencies pe on (el.element_normalize_category=pe.normalized_category)
		where type_id<>'CARBONO' and type_id='PTAP' and bn.study_case_id=varstudycase
		group by pe.unitary_process, type_id
		union
		select pe.unitary_process,type_id, round(cast(sum(distinct vpn_med_benefit) as numeric),2)::double precision 
		from waterproof_reports_analysis_benefits bn
		inner join public.waterproof_intake_elementsystem es on (bn.element_id = es.id) inner join
		public.waterproof_intake_processefficiencies pe on (es.normalized_category=pe.normalized_category)
		where type_id<>'CARBONO' and type_id='INTAKE' and bn.study_case_id=varstudycase
		group by pe.unitary_process, type_id;	
end;
$$;


--
-- Name: __get_report_incicator_benefist_grapha_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_incicator_benefist_grapha_fastflood(varstudycase integer) RETURNS TABLE(element_normalize_categorya character varying, type_ida character varying, vpn_med_benefita double precision)
    LANGUAGE plpgsql
    AS $$
begin
	return query				
		select 
			pe.unitary_process,
			case 
				when type_id='CARBONO' then 'CARBON' 
				when type_id='PTAP' then 'DWTP' else type_id end   
			as		
			type_id, round(cast(sum(distinct vpn_med_benefit) as numeric),2)::double precision as Sumvpn_med_benefit
		from waterproof_reports_analysis_benefits_fastflood bn
		where type_id<>'CARBONO' and type_id='PTAP' and bn.study_case_id=varstudycase
		group by pe.unitary_process, type_id
		union
		select pe.unitary_process,type_id, round(cast(sum(distinct vpn_med_benefit) as numeric),2)::double precision 
		from waterproof_reports_analysis_benefits_fastflood bn
		where type_id<>'CARBONO' and type_id='INTAKE' and bn.study_case_id=varstudycase
		group by pe.unitary_process, type_id;	
end;
$$;


--
-- Name: __get_report_oportunity_result_indicators(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_oportunity_result_indicators(varstudycase integer) RETURNS TABLE(currencyr character varying, valorr double precision, descripcion text)
    LANGUAGE plpgsql
    AS $$
begin
	return query
		select 
			currency,
			round(cast(roi_medium as numeric),2):: double precision,	
			case when roi_medium <1 then 'Low::Dark Red'
			when roi_medium>=1 and roi_medium<=2 then 'High::Light Green'
			when roi_medium>2 then 'Very high::Dark Green' end as ResultT
		from public.waterproof_report_result_roi
		where study_case_id = varStudyCase
	union
	-- Total estimated medium Investment
		select currency, round(cast(sum(vpn_med_benefit) as numeric),2)::double precision as ValorOp, 'TotalEstimatedInvestment' as IndK
		from waterproof_reports_analysis_benefits  
		where study_case_id = varStudyCase
		group by 1,3 
	union
		--Total treatment cost medium savings
		select currency, round(cast (sum(vpn_med_cost) as numeric),2)::double precision as ValorOp, 'TotalTreatmentCostSavings' as IndK
		from waterproof_reports_analysis_costs  
		where study_case_id = varStudyCase
		group by 1,3
	union
	-- Time Frame
		select analysis_currency,analysis_period_value as TimeAnalysis, 'TimeFrame' as IndK 
		from public.waterproof_study_cases_studycases
		where id = varStudyCase
	union 
		-- TotalAreaInterventionSize (Hec)
		select 'NoAplica', 
		round(cast(Sum(area_converted_ha) as numeric),2):: double precision,
		'TotalAreaInterventionSize(Hec)'
		from public.waterproof_reports_rios_ipa  inner join public.waterproof_intake_intake ii on (intake_id=ii.id)
		where study_case_id=varstudycase and "year"<>9999 and sbn not like ('%Tot%') and sbn not like ('%Floating Budget%')
		group by 1,3;
		

end;
$$;


--
-- Name: __get_report_oportunity_result_indicators_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_oportunity_result_indicators_fastflood(varstudycase integer) RETURNS TABLE(currencyr character varying, valorr double precision, descripcion text)
    LANGUAGE plpgsql
    AS $$
begin
	return query
		select 
			currency,
			round(cast(roi_medium as numeric),2):: double precision,	
			case when roi_medium <1 then 'Low::Dark Red'
			when roi_medium>=1 and roi_medium<=2 then 'High::Light Green'
			when roi_medium>2 then 'Very high::Dark Green' end as ResultT
		from public.waterproof_report_result_roi_fastflood
		where study_case_id = varStudyCase
	union
	-- Total estimated medium Investment
		select currency, round(cast(sum(vpn_med_benefit) as numeric),2)::double precision as ValorOp, 'TotalEstimatedInvestment' as IndK
		from waterproof_reports_analysis_benefits_fastflood  
		where study_case_id = varStudyCase
		group by 1,3 
	union
		--Total treatment cost medium savings
		select currency, round(cast (sum(vpn_med_cost) as numeric),2)::double precision as ValorOp, 'TotalTreatmentCostSavings' as IndK
		from waterproof_reports_analysis_costs_fastflood  
		where study_case_id = varStudyCase
		group by 1,3
	union
	-- Time Frame
		select analysis_currency,analysis_period_value as TimeAnalysis, 'TimeFrame' as IndK 
		from public.waterproof_fastflood_studycases
		where id = varStudyCase
	union 
		-- TotalAreaInterventionSize (Hec)
		select 'NoAplica', 
		round(cast(Sum(area_converted_ha) as numeric),2):: double precision,
		'TotalAreaInterventionSize(Hec)'
		from public.waterproof_reports_rios_ipa_fastflood  inner join public.waterproof_fastflood_watershed ii on (intake_id=ii.id)
		where study_case_id=varstudycase and "year"<>9999 and sbn not like ('%Tot%') and sbn not like ('%Floating Budget%')
		group by 1,3;
		

end;
$$;


--
-- Name: __get_report_oportunity_result_maps(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_oportunity_result_maps(varstudycase integer) RETURNS TABLE(nombrer character varying, puntomap text, intakeid integer)
    LANGUAGE plpgsql
    AS $$
begin
	return query
			select ii."name",IP."geomIntake",ii.id from public.waterproof_study_cases_studycases SC inner join 
			public.waterproof_study_cases_studycases_intakes SI on (sc.id=si.studycases_id)
			inner join public.waterproof_intake_polygon IP on (si.intake_id=ip.intake_id)
			inner join public.waterproof_intake_intake II on (si.intake_id=ii.id)
			where sc.id = varStudyCase
			union
			select ii."name",IP."geomIntake",ii.id 
			from public.waterproof_study_cases_studycases SC  
			inner join public.waterproof_study_cases_studycases_ptaps stpt on (sc.id=stpt.studycases_id)
			inner join public.waterproof_treatment_plants_ptap tpp on (stpt.header_id=tpp.ptap_plant_id)
			inner join public.waterproof_treatment_plants_csinfra tpcs on (tpp.ptap_plant_id=tpcs.csinfra_plant_id)
			inner join public.waterproof_intake_elementsystem inelsys on (tpcs.csinfra_elementsystem_id=inelsys.id)
			inner join public.waterproof_intake_polygon IP on (inelsys.intake_id=ip.intake_id)
			inner join public.waterproof_intake_intake II on (inelsys.intake_id=ii.id)
			where sc.id = varStudyCase;
	
/*
		select ii."name",IP."geomIntake",ii.id from public.waterproof_study_cases_studycases SC inner join 
		public.waterproof_study_cases_studycases_intakes SI on (sc.id=si.studycases_id)
		inner join public.waterproof_intake_polygon IP on (si.intake_id=ip.intake_id)
		inner join public.waterproof_intake_intake II on (si.intake_id=ii.id)
		where sc.id = varStudyCase;
*/	
end;
$$;


--
-- Name: __get_report_oportunity_result_mapsfra(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_oportunity_result_mapsfra(varstudycase integer) RETURNS TABLE(nombrer character varying, puntomap text)
    LANGUAGE plpgsql
    AS $$
begin
	return query
		select ii."name",IP."geomPoint" from public.waterproof_study_cases_studycases SC inner join 
		public.waterproof_study_cases_studycases_intakes SI on (sc.id=si.studycases_id)
		inner join public.waterproof_intake_polygon IP on (si.intake_id=ip.intake_id)
		inner join public.waterproof_intake_intake II on (si.intake_id=ii.id)
		where sc.id = varStudyCase
		union
		select ii."name",IP."geomPoint" 
		from public.waterproof_study_cases_studycases SC  
		inner join public.waterproof_study_cases_studycases_ptaps stpt on (sc.id=stpt.studycases_id)
		inner join public.waterproof_treatment_plants_ptap tpp on (stpt.header_id=tpp.ptap_plant_id)
		inner join public.waterproof_treatment_plants_csinfra tpcs on (tpp.ptap_plant_id=tpcs.csinfra_plant_id)
		inner join public.waterproof_intake_elementsystem inelsys on (tpcs.csinfra_elementsystem_id=inelsys.id)
		inner join public.waterproof_intake_polygon IP on (inelsys.intake_id=ip.intake_id)
		inner join public.waterproof_intake_intake II on (inelsys.intake_id=ii.id)
		where sc.id = varStudyCase;
		
		
end;
$$;


--
-- Name: __get_report_temporalprojection(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_temporalprojection(varstudycase integer) RETURNS TABLE(timea smallint, stage_filtera text, volume_of_water_yield_change_in_timea double precision, annual_volume_base_flow_change_in_timea double precision, total_sediments_change_in_timea double precision, nitrogen_load_change_in_timea double precision, phosphorus_load_change_in_timea double precision, carbon_storage_change_in_timea double precision, stagea character varying, intake_ida integer, namea character varying)
    LANGUAGE plpgsql
    AS $$
begin
	return query										
				SELECT time,CASE stage WHEN 'NBS' THEN 'NBS Scenario' WHEN 'BAU' THEN 'Business as usual' END AS stage_filter,
				round(cast("AWY(m3)" as numeric),2)::double precision AS volume_of_water_yield_change_in_time,
				round(cast("BF(m3)" as numeric),2)::double precision AS annual_volume_base_flow_change_in_time,
				round(cast("Wsed(Ton)" as numeric),2)::double precision AS total_sediments_change_in_time,
				round(cast("WN(Kg)" as numeric),2)::double precision AS nitrogen_load_change_in_time,
				round(cast("WP(kg)" as numeric),2)::double precision AS phosphorus_load_change_in_time,
				round(cast("WC(Ton)" as numeric),2)::double precision AS carbon_storage_change_in_time,
				stage,
				intake_id,
				"name"
				FROM public.waterproof_reports_desagregation
				inner join public.waterproof_intake_intake on (intake_id=public.waterproof_intake_intake.id)
				WHERE time !=0 and  study_case_id = varstudycase
				order by "time", stage;			
end;
$$;


--
-- Name: __get_report_total_benefits_for_milion(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_report_total_benefits_for_milion(varstudy_case_id integer) RETURNS TABLE(eficiencia_awyr numeric, eficiencia_wnr numeric, eficiencia_wpr numeric, eficiencia_wsedr numeric, eficiencia_bfr numeric, eficiencia_wcr numeric)
    LANGUAGE plpgsql
    AS $$
begin
                                            return query
                                                           with CostosTotales as (
                                                                                                                      SELECT currency, "time" tt, sum(value) as vtCosto, sum(vpn_min_cost) as vtMinCosto, 
                                                                                                                      sum(vpm_max_cost) as vtMaxCosto, sum(vpn_med_cost) as vtMedCosto 
                                                                                                                      FROM waterproof_reports_analysis_costs
                                                                                                                      where study_case_id=varstudy_case_id  
                                                                                                                      group by 1,2
                                                                                                                      ),
                                                                          indInvestValue as (
                                                                                                                      select * from public.waterproof_reports_investindicators 
                                                                                                                      where study_case_id =varstudy_case_id and "type" = 'Total_ind' 
                                                                                                                      )
                                                                                                                      
                                                           select round(((max(c.awy)/sum(a.vtMedCosto))*1000000)::numeric,2) as Eficiencia_AWY,
                                                           round(((min(c.wn_kg)/sum(a.vtMedCosto))*1000000)::numeric,2) as Eficiencia_WN,
                                                           round(((min(c.wp_kg)/sum(a.vtMedCosto))*1000000)::numeric,2) as Eficiencia_WP,
                                                           round(((min(c.wsed_ton)/sum(a.vtMedCosto))*1000000)::numeric,2) as Eficiencia_WSed,
                                                           round(((max(c.bf_m3)/sum(a.vtMedCosto))*1000000)::numeric,2) as Eficiencia_BF,
                                                           round(((max(c.wc_ton)/sum(a.vtMedCosto))*1000000)::numeric,2) as Eficiencia_WC
                                                            from CostosTotales a 
                                                           
                                                           inner join indInvestValue c on (a.tt=c."time");
end;
$$;


--
-- Name: __get_reports_compare_maps(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_reports_compare_maps(varstudycase integer) RETURNS TABLE(foldera text, studycasea integer, regiona character varying, yeara integer, intakea integer, centera text, nameintake character varying)
    LANGUAGE plpgsql
    AS $$
begin
	
	if exists(select * from public.waterproof_study_cases_studycases_intakes where studycases_id=varstudycase) then
		return query
				select split_part(split_part(link,'/',5),'.',1) as Folder,z.study_case_id_id as studycase, "label" as region,cs.time_implement as "year",sci.intake_id as intake,
				st_asgeojson(st_centroid(pg.geom),2) as center, ii."name" 
				from public.waterproof_study_cases_studycases cs inner join 
				public.waterproof_study_cases_studycases_intakes sci on (cs.id=sci.studycases_id) inner join
				public.waterproof_reports_zip z on (cs.id=z.study_case_id_id) inner join public.waterproof_intake_polygon pg 
				on (sci.intake_id=pg.intake_id) inner join public.waterproof_intake_basins ib on (basin_id=ib.id) 
				inner join public.waterproof_intake_intake ii on (sci.intake_id=ii.id)
				where z.study_case_id_id=varstudycase;
	--			limit 1;
	else
		return query
				select split_part(split_part(link,'/',5),'.',1) as Folder,z.study_case_id_id as studycase, 
				"label" as region,cs.time_implement as "year",sci.water_intake as intake,
				st_asgeojson(st_centroid(pg.geom),2) as center, ii."name" 
				from public.waterproof_study_cases_studycases cs inner join 
				(select studycase_id, water_intake from public.waterproof_reports_wbintake where studycase_id=varstudycase limit 1) sci on (cs.id=sci.studycase_id)
				inner join
				public.waterproof_reports_zip z on (cs.id=z.study_case_id_id) inner join public.waterproof_intake_polygon pg 
				on (sci.water_intake=pg.intake_id) inner join public.waterproof_intake_basins ib on (basin_id=ib.id) 
				inner join public.waterproof_intake_intake ii on (sci.water_intake=ii.id)
				where z.study_case_id_id=varstudycase;
	
	
	end if;
end;
$$;


--
-- Name: __get_reports_compare_maps_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_reports_compare_maps_fastflood(varstudycase integer) RETURNS TABLE(foldera text, studycasea integer, regiona character varying, yeara integer, intakea integer, centera text, nameintake character varying)
    LANGUAGE plpgsql
    AS $$
begin
	
	if exists(select * from public.waterproof_fastflood_studycases_watershed where studycases_id=varstudycase) then
		return query
				select split_part(split_part(link,'/',5),'.',1) as Folder,z.study_case_id as studycase, "label" as region,cs.time_implement as "year",sci.watershed_id as intake,
				st_asgeojson(st_centroid(pg.geom),2) as center, ii."name" 
				from public.waterproof_fastflood_studycases cs inner join 
				public.waterproof_fastflood_studycases_watershed sci on (cs.id=sci.studycases_id) inner join
				public.waterproof_reports_zip_fastflood z on (cs.id=z.study_case_id) inner join public.waterproof_fastflood_polygon pg 
				on (sci.watershed_id=pg.watershed_id) inner join public.waterproof_intake_basins ib on (basin_id=ib.id) 
				inner join public.waterproof_fastflood_watershed ii on (sci.watershed_id=ii.id)
				where z.study_case_id=varstudycase;
	--			limit 1;
	-- else
	-- 	return query
	-- 			select split_part(split_part(link,'/',5),'.',1) as Folder,z.study_case_id as studycase, 
	-- 			"label" as region,cs.time_implement as "year",sci.water_intake as intake,
	-- 			st_asgeojson(st_centroid(pg.geom),2) as center, ii."name" 
	-- 			from public.waterproof_study_cases_studycases cs inner join 
	-- 			(select studycase_id, water_intake from public.waterproof_reports_wbintake where studycase_id=varstudycase limit 1) sci on (cs.id=sci.studycase_id)
	-- 			inner join
	-- 			public.waterproof_reports_zip_fastflood z on (cs.id=z.study_case_id) inner join public.waterproof_fastflood_polygon pg 
	-- 			on (sci.water_intake=pg.watershed_id) inner join public.waterproof_intake_basins ib on (basin_id=ib.id) 
	-- 			inner join public.waterproof_fastflood_watershed ii on (sci.water_intake=ii.id)
	-- 			where z.study_case_id=varstudycase;
	
	
	end if;
end;
$$;


--
-- Name: __get_size_recomended_intervention(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_size_recomended_intervention(varsstudycaseid integer) RETURNS TABLE(porcentajeipler numeric)
    LANGUAGE plpgsql
    AS $$
begin 
		
		return query
				with resultIntake(aImp,aInte) as ( 
				SELECT 
				ai.haImplemented*10000 as AreaImplementada,
				st_area(st_transform(ST_SetSRID(st_geomfromgeojson(json_array_elements((cast("geomIntake" as json))->'features')->'geometry'),4326),3857)) as areaIntake
				, ip.intake_id
				FROM  public.waterproof_intake_polygon ip 
				INNER JOIN (
				select sum(recommendedinterventionf) as haImplemented, intake_idf from __get_report_analisys_beneficsc(varsstudycaseid) group by 2
				) as ai 
				on (ip.intake_id=ai.intake_idf))
				
				select round(cast((sum(aImp)/sum(aInte))*100 as numeric),2) as porcentajeIple
				from resultIntake;
end;
$$;


--
-- Name: __get_wp_aqueduct_indicator_graph(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_wp_aqueduct_indicator_graph(varstudycase integer) RETURNS TABLE(result_grouperr character varying, indicatorr character varying, siglar character varying, value_indr smallint, descriptionr character varying, inteker integer, namea character varying, valudest character varying)
    LANGUAGE plpgsql
    AS $$
begin
	return query
				select distinct ai.result_grouper,ai."indicator",a.sigla,a.value_ind,ai.description,
				ipa.intake_id, ii."name",ads.description
				from  public.waterproof_reports_aqueduct_indicators ai 
				inner join public.waterproof_reports_aqueduct a on (ai.initials=a.sigla) 
				inner join public.waterproof_reports_aqueduct_desc_state ads on (a.value_ind=ads.valuer)
				inner join public.waterproof_reports_rios_ipa ipa on (a.intake_id=ipa.intake_id)
				inner join public.waterproof_intake_intake ii on (ipa.intake_id=ii.id)
				where ipa.study_case_id = varstudycase;
	
-- 17/11/2021 cambio solicitado por Pilar y Carlos, se requiere que muestre los valores de las intake de PTAP tambien
/*	
		select ai.result_grouper,ai."indicator",a.sigla,a.value_ind,ai.description,
		si.intake_id, ii."name",ads.description
		from  public.waterproof_reports_aqueduct_indicators ai 
		inner join public.waterproof_reports_aqueduct a on (ai.initials=a.sigla) 
		inner join public.waterproof_reports_aqueduct_desc_state ads on (a.value_ind=ads.valuer)
		inner join public.waterproof_study_cases_studycases_intakes si 
		on (a.intake_id=si.intake_id) inner join public.waterproof_intake_intake ii on (si.intake_id=ii.id)
		where si.studycases_id = varstudycase
		order by result_grouper,si.intake_id;
*/		
end;
$$;


--
-- Name: __get_wp_report_ppalselect(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__get_wp_report_ppalselect(varstudycase integer) RETURNS TABLE(selectora character varying, intakeida integer, centera text, studycases_ida integer, namea character varying)
    LANGUAGE plpgsql
    AS $$
begin
	return query
				SELECT ii.name AS selector, ii.id AS intakeid, st_asgeojson(st_centroid(g.geom),2) as center,  
				si.studycases_id, sc.name  FROM public.waterproof_study_cases_studycases
				SC INNER JOIN public.waterproof_study_cases_studycases_intakes SI ON (sc.id=si.studycases_id) INNER JOIN 
				public.waterproof_intake_intake II ON (si.intake_id=ii.id) LEFT JOIN public.waterproof_intake_polygon g on 
				(ii.id = g.id) WHERE sc.id = varstudycase
				union 
				SELECT ii.name AS selector, ii.id AS intakeid, st_asgeojson(st_centroid(g.geom),2) as center,  
				si.studycases_id, sc.name
				FROM public.waterproof_study_cases_studycases
				SC INNER JOIN public.waterproof_study_cases_studycases_ptaps SI ON (sc.id=si.studycases_id) INNER JOIN
				public.waterproof_treatment_plants_csinfra tpc on (si.header_id=tpc.csinfra_plant_id) INNER join
				public.waterproof_intake_elementsystem IE on (tpc.csinfra_elementsystem_id=IE.id) inner JOIN
				public.waterproof_intake_intake II ON (IE.intake_id=ii.id) LEFT JOIN public.waterproof_intake_polygon g on 
				(ii.id = g.id) WHERE sc.id = varstudycase;
end;
$$;


--
-- Name: __wp_aqueduct_get_data(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_aqueduct_get_data(id_intake_in integer) RETURNS TABLE(datap bigint)
    LANGUAGE plpgsql
    AS $$
	begin 
		return query 
		select count(id) 
		from public.waterproof_reports_aqueduct 
		where intake_id = id_intake_in;
	END;
$$;


--
-- Name: __wp_aqueduct_insert(integer, character varying, character varying, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_aqueduct_insert(intake_id_in integer, aqueduct_indicators_in character varying, sigla_in character varying, value_ind_in integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN		
	INSERT INTO public.waterproof_reports_aqueduct(intake_id,aqueduct_indicators,sigla,value_ind)
	VALUES(intake_id_in,cast(aqueduct_indicators_in as character varying),cast(sigla_in as character varying),value_ind_in);
    END;
$$;


--
-- Name: __wp_aqueduct_insert_fastflood(integer, character varying, character varying, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_aqueduct_insert_fastflood(intake_id_in integer, aqueduct_indicators_in character varying, sigla_in character varying, value_ind_in integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN		
	INSERT INTO public.waterproof_reports_aqueduct_fastflood(intake_id,aqueduct_indicators,sigla,value_ind)
	VALUES(intake_id_in,cast(aqueduct_indicators_in as character varying),cast(sigla_in as character varying),value_ind_in);
    END;
$$;


--
-- Name: __wp_check_nbs_transition_map(integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_check_nbs_transition_map(idnbs integer, transition character varying) RETURNS TABLE(trans_lucode character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select rtransition.id_transition as trans_lucode
						from waterproof_nbs_ca_waterproofnbsca nbs
						join waterproof_nbs_ca_waterproofnbsca_rios_transformations rt on nbs.id = rt.waterproofnbsca_id
						join waterproof_nbs_ca_riostransformation rtrans on rt.riostransformation_id = rtrans.id
						join waterproof_nbs_ca_riosactivity ra on ra.id = rtrans.activity_id
						join waterproof_nbs_ca_riostransition rtransition on rtransition.id=ra.transition_id AND rtransition.id_transition=transition
						where nbs.id =idNbs;
    END;
$$;


--
-- Name: __wp_dissagregation_invest(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_dissagregation_invest(intakes integer, cases integer) RETURNS TABLE(name character varying, awyres double precision, wsedres double precision, wnres double precision, wpres double precision, bfres double precision, wcres double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select 
	case 
		when type='NBS' then concat('NBS-Year_',year)
		when type='CURRENT' then '1_Current'
		when type='BAU' then '2_BaU'
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
	order by name;
    END;
$$;


--
-- Name: __wp_dissagregation_invest_fastflood(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_dissagregation_invest_fastflood(intakes integer, cases integer) RETURNS TABLE(name character varying, awyres double precision, wsedres double precision, wnres double precision, wpres double precision, bfres double precision, wcres double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select 
	case 
		when type='NBS' then concat('NBS-Year_',year)
		when type='CURRENT' then '1_Current'
		when type='BAU' then '2_BaU'
		else type
	end as name,
	awy AS AWY,
	wsed_ton as Wsed,
	wn_kg as WN,
	wp_kg as WP,
	bf_m3 as BF,
	wc_ton as WC
	from
	public.waterproof_reports_invest_results_fastflood
	where intake_id=intakes and study_case_id = cases
	order by name;
    END;
$$;


--
-- Name: __wp_dissagregation_nbs_first(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_dissagregation_nbs_first(studycase integer) RETURNS TABLE(name character varying, timeres double precision, benefitres numeric, reference character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select
	t1.NBS_Name,
	t1.Time_Max_Benefit,
	t1.Benefit_t0,
	t1.reference
	from
	(select
		nbsca.id as iadi,
		nbsca.name as NBS_Name,
		nbsca.max_benefit_req_time::float as Time_Max_Benefit,
		nbsca.profit_pct_time_inter_assoc as Benefit_t0,
		nbsca.slug as reference
		from
		waterproof_study_cases_studycases_nbs nbs
		join public.waterproof_nbs_ca_waterproofnbsca nbsca on nbs.nbs_id = nbsca.id
		where nbs.studycase_id=studycase
	 order by nbsca.id)as t1;
    END;
$$;


--
-- Name: __wp_dissagregation_nbs_first_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_dissagregation_nbs_first_fastflood(studycase integer) RETURNS TABLE(name character varying, timeres double precision, benefitres numeric, reference character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select t1.NBS_Name, t1.Time_Max_Benefit, t1.Benefit_t0, t1.reference
	from
	(select
		nbsca.id as iadi, nbsca.name as NBS_Name, nbsca.max_benefit_req_time::float as Time_Max_Benefit,
		nbsca.profit_pct_time_inter_assoc as Benefit_t0, nbsca.slug as reference
		from
		waterproof_fastflood_studycases_nbs nbs
		join public.waterproof_nbs_ca_waterproofnbsca nbsca on nbs.nbs_id = nbsca.id
		where nbs.studycase_id=studycase
	 order by nbsca.id)as t1;
    END;
$$;


--
-- Name: __wp_dissagregation_nbs_second(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_dissagregation_nbs_second(studycase integer) RETURNS TABLE(namesbn character varying, timeres integer, areares double precision)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: __wp_dissagregation_nbs_second(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_dissagregation_nbs_second(studycase integer, varintake integer) RETURNS TABLE(namesbn character varying, timeres integer, areares double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select
	    rios.sbn,
	    rios.year,
		rios.area_converted_ha
		from
		public.waterproof_reports_rios_ipa rios
		join public.waterproof_nbs_ca_waterproofnbsca nbsca on nbsca.slug = rios.sbn
		where rios.study_case_id=studycase and rios.year <999 and intake_id = varIntake
		order by rios.year,rios.sbn;
    END;
$$;


--
-- Name: __wp_dissagregation_nbs_second_fastflood(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_dissagregation_nbs_second_fastflood(studycase integer, varwatershed integer) RETURNS TABLE(namesbn character varying, timeres integer, areares double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select
	    rios.sbn,
	    rios.year,
		rios.area_converted_ha
		from
		public.waterproof_reports_rios_ipa_fastflood rios
		join public.waterproof_nbs_ca_waterproofnbsca nbsca on nbsca.slug = rios.sbn
		where rios.study_case_id=studycase and rios.year <999 and intake_id = varWatershed
		order by rios.year,rios.sbn;
    END;
$$;


--
-- Name: __wp_dissagregation_time(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_dissagregation_time(studycase integer) RETURNS TABLE(timeres integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select 
	analysis_period_value 
	from waterproof_study_cases_studycases 
	where id = studycase;
    END;
$$;


--
-- Name: __wp_dissagregation_time_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_dissagregation_time_fastflood(studycase integer) RETURNS TABLE(timeres integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select 
	analysis_period_value 
	from waterproof_fastflood_studycases 
	where id = studycase;
    END;
$$;


--
-- Name: __wp_get_activities(integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_activities(listnbs integer[]) RETURNS TABLE(name character varying, unit_implementation_cost numeric, unit_maintenance_cost numeric, id integer, unit_oportunity_cost numeric, periodicity_maitenance integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query 
			select nbs.slug as name,nbs.unit_implementation_cost, nbs.unit_maintenance_cost,nbs.id,nbs.unit_oportunity_cost,nbs.periodicity_maitenance
				from waterproof_nbs_ca_waterproofnbsca nbs
				where nbs.id = ANY(listnbs);
    END;
$$;


--
-- Name: __wp_get_activities_shapefiles(integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_activities_shapefiles(listnbs integer[]) RETURNS TABLE(id integer, activity character varying, action character varying, geom public.geometry)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query 					
				select shp.id,nbs.slug as name,shp.action,shp.area
					from waterproof_nbs_ca_waterproofnbsca nbs
					join waterproof_nbs_ca_activityshapefile shp on nbs.activity_shapefile_id = shp.id
					where nbs.id = ANY(listNbs);
    END;
$$;


--
-- Name: __wp_get_aggregate_result_function_cost(character varying, integer, integer, integer, double precision, character varying, integer, integer, character varying, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_aggregate_result_function_cost(varstage character varying, varintake_id_plant_id integer, varelement_id integer, varyear integer, varvalue_calculate double precision, varcurrency_function character varying, varstudy_case_id integer, varuser_id integer, vartype character varying, varfunction_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
	insert into public.waterproof_reports_result_cost_function 
	(stage,intake_id_plant_id,element_id,"year",value_calculate,currency_function,date_excution,study_case_id,user_id,type_desc,function_id)
	values (varstage,varintake_id_plant_id,varelement_id,varyear,varvalue_calculate,varcurrency_function,now(),varstudy_case_id,varuser_id,vartype,varfunction_id);
	
end;
$$;


--
-- Name: __wp_get_biophysycal_by_condition(integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_biophysycal_by_condition(integer, character varying) RETURNS TABLE(lucode integer)
    LANGUAGE plpgsql
    AS $_$
	BEGIN
			return query 
					select b.lucode from (
					select a.lucode, a.usle_c, a.usle_p 
					from public.waterproof_parameters_biophysical as a
					where a."default"='y' and a.macro_region=$2 and 
					a.lucode NOT IN (select b.lucode 
								from public.waterproof_parameters_biophysical as b
								where b."default"='N' and b.macro_region=$2 and b.study_case_id=$1)
					union
					select c.lucode, c.usle_c, c.usle_p 
					from public.waterproof_parameters_biophysical as c
					where c."default"='N' and c.macro_region=$2 and c.study_case_id=$1
					order by usle_c, usle_p asc) b;

END;
$_$;


--
-- Name: __wp_get_biophysycal_consolidate(integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_biophysycal_consolidate(integer, character varying) RETURNS TABLE(lucode integer, lulc_desc text, description text, kc double precision, root_depth double precision, usle_c double precision, usle_p double precision, load_n double precision, eff_n double precision, load_p double precision, eff_p double precision, crit_len_n integer, crit_len_p integer, proportion_subsurface_n double precision, cn_a double precision, cn_b double precision, cn_c double precision, cn_d double precision, kc_1 double precision, kc_2 double precision, kc_3 double precision, kc_4 double precision, kc_5 double precision, kc_6 double precision, kc_7 double precision, kc_8 double precision, kc_9 double precision, kc_10 double precision, kc_11 double precision, kc_12 double precision, c_above double precision, c_below double precision, c_soil double precision, c_dead double precision, sed_exp double precision, sed_ret double precision, rough_rank double precision, cover_rank double precision, p_ret double precision, p_exp double precision, n_ret double precision, n_exp double precision, native_veg integer, lulc_veg integer, macro_region text, "default" text, id integer, intake_id integer, study_case_id integer, user_id integer)
    LANGUAGE plpgsql
    AS $_$
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
$_$;


--
-- Name: __wp_get_biophysycal_params(text, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_biophysycal_params(macro_value text, default_value text, user_value integer) RETURNS TABLE(lucode integer, lulc_desc text, description text, kc double precision, root_depth double precision, usle_c double precision, usle_p double precision, load_n double precision, eff_n double precision, load_p double precision, eff_p double precision, crit_len_n integer, crit_len_p integer, proportion_subsurface_n double precision, cn_a double precision, cn_b double precision, cn_c double precision, cn_d double precision, kc_1 double precision, kc_2 double precision, kc_3 double precision, kc_4 double precision, kc_5 double precision, kc_6 double precision, kc_7 double precision, kc_8 double precision, kc_9 double precision, kc_10 double precision, kc_11 double precision, kc_12 double precision, c_above double precision, c_below double precision, c_soil double precision, c_dead double precision, sed_exp double precision, sed_ret double precision, rough_rank double precision, cover_rank double precision, p_ret double precision, p_exp double precision, n_ret double precision, n_exp double precision, native_veg integer, lulc_veg integer, macro_region text, "default" text, id integer, intake_id integer, study_case_id integer, user_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select *
			from waterproof_parameters_biophysical param WHERE param.macro_region=macro_value AND param.default=default_value;	
    END;
$$;


--
-- Name: __wp_get_catchment_basin(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_catchment_basin(idcatchment integer) RETURNS TABLE(id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select basin.basin_id
			from waterproof_intake_polygon basin WHERE intake_id=idcatchment;	
    END;
$$;


--
-- Name: __wp_get_closest_cities(numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_closest_cities(x numeric, y numeric) RETURNS TABLE(id_city integer, city character varying, factor numeric, dist numeric, lon numeric, lat numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE		
    BEGIN				
			return query select c.id, c.name, wpc.global_multiplier_factor as factor, ST_Distance(ST_SetSRID(ST_MakePoint(x,y),4326), c.geom)::numeric(8,5) AS dist, c.longitude::numeric(8,5) as lon, c.latitude::numeric(8,5) as lat
							FROM public.waterproof_parameters_cities c 
							left join public.waterproof_parameters_countries wpc 
							on c.country_id = wpc.id 
							ORDER BY dist LIMIT 5;
				
    END;
$$;


--
-- Name: __wp_get_currency_cost_calculated(integer, character varying[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_currency_cost_calculated(idcase integer, listnbs character varying[]) RETURNS TABLE(type_or_id character varying, cost character varying, value numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select currency.type_or_id,currency.cost,currency.value
			from waterproof_study_cases_currency_cost_calculated currency WHERE currency.studycase_id=idcase and currency.type_or_id=ANY(listnbs);	
    END;
$$;


--
-- Name: __wp_get_currency_cost_calculated_fastflood(integer, character varying[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_currency_cost_calculated_fastflood(idcase integer, listnbs character varying[]) RETURNS TABLE(type_or_id character varying, cost character varying, value numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query 
			select currency.type_or_id,currency.cost,currency.value
			from 
				waterproof_fastflood_currency_cost_calculated currency 
			WHERE 
				currency.studycase_id=idcase and currency.type_or_id=ANY(listnbs);	
    END;
$$;


--
-- Name: __wp_get_default_objectives_priorities(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_default_objectives_priorities(objective integer, transition_id integer, parameter_value integer) RETURNS TABLE(priority_value character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
		RETURN QUERY SELECT priorit.value as priority_value
			FROM waterproof_parameters_objetives_priorities priorit WHERE priorit.model=objective AND priorit.transition=transition_id 
			AND priorit.parameter=parameter_value AND priorit.default='y' AND priorit.user_id=1000;
    END;
$$;


--
-- Name: __wp_get_default_transitions_priorities(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_default_transitions_priorities(objective integer, transition_id integer) RETURNS TABLE(priority_value character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select priorit.value as priority_value
			from waterproof_parameters_transitions_priorities priorit WHERE priorit.model=objective AND priorit.transition=transition_id AND priorit.default='y'
			AND priorit.user_id=1000;	
    END;
$$;


--
-- Name: __wp_get_function_cost_study_cases(integer, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_function_cost_study_cases(casestudyid integer, varstage text, vartypedesca text) RETURNS TABLE("yearA" integer, elementa integer, currencymoneycosta character varying, global_multiplier_factora double precision, stagea character varying, awya double precision, q_l_sa double precision, cn_mg_la double precision, cp_mg_la double precision, csed_mg_la double precision, wn_kga double precision, wp_kga double precision, wsed_tona double precision, wn_ret_kga double precision, wp_ret_tona double precision, wsed_ret_tona double precision, functioncosa character varying, graphida integer, type_desca text, funcion_ida integer, intake_ptap_id integer, ratio_changea double precision, analysis_currencya character varying)
    LANGUAGE plpgsql
    AS $$
begin
	return query 

-- El valor de la constante 3.170979198364586504312531709792e-5 sale de la operación (1000/(365*24*3600))	
		with Ntb ("year", "element", currencyMoneyCost, global_multiplier_factor,stage, awy, q_l_s, cn_mg_l, cp_mg_l, csed_mg_l,
				wn_kg,wp_kg,wsed_ton,wn_ret_kg,wp_ret_ton,wsed_ret_ton, "function", "graphId", type_desc, funcion_id,intake_id,ratio_change ) as 
				(select distinct "year", "element", coB.currency as currencyMoneyCost, co.global_multiplier_factor::float, stage,
				wi.awy, 3.170979198364586504312531709792e-5*wi.q_l_s as q_l_s, wi.cn_mg_l, wi.cp_mg_l, wi.csed_mg_l,
				wi.wn_kg, wi.wp_kg, wi.wsed_ton, wi.wn_ret_kg, wi.wp_ret_ton, wi.wsed_ret_ton, ucf."function", elt."graphId",
				'intake' as type_desc, ucf.id as funcion_id,ucf.intake_id as intake_ptap_id,
				case when stcu.value is null then 1 else stcu.value end::float as tasaCambio, sc.analysis_currency 
				from public.waterproof_reports_wbintake wi left join public.waterproof_intake_usercostfunctions ucf 
				on (wi.water_intake=ucf.intake_id and wi."element"=ucf.element_system_id)
				left join public.waterproof_study_cases_studycases sc on (wi.studycase_id=sc.id)
				left join public.waterproof_parameters_cities ci on (sc.city_id=ci.id) 
				left join public.waterproof_parameters_countries co on (ci.country_id=co.id)
				left join public.waterproof_parameters_countries coB on (ucf.currency_id=coB.id)
				left join public.waterproof_intake_elementsystem elt on (wi."element"=elt.id)
				left join public.waterproof_study_cases_studycases_currency stcu on (coB.currency=stcu.currency and stcu.studycase_id=caseStudyId)
				inner join public.waterproof_study_cases_studycases_intakes sInt on (wi.studycase_id=sInt.studycases_id and wi.water_intake=sInt.intake_id)
				where wi.studycase_id = caseStudyId and ucf."function" not in ('NO EXISTE') and stage=varStage
				union
				select distinct wp."year", wp.element_id, case when f.function_currency is null then 'N/A' else f.function_currency end,
					case when f.function_factor::float is null then 0 else f.function_factor::float end,
					wp.stage, wp.awy, 3.170979198364586504312531709792e-5*wp.awy as q_l_s, wp.cn_mg_l, wp.cp_mg_l, wp.csed_mg_l,
					wp.wn_kg, wp.wp_kg, wp.wsed_ton, wp.wn_ret_kg, wp.wp_ret_kg, wp.wsed_ret_ton,
					f.function_value,e.element_graph_id,'PTAP' as type_desc, f.id as funcion_id, wp.ptap_id as intake_ptap_id, 
					case when stcu.tasadecambio is null then 1 else stcu.tasadecambio end::float as tasaCambio, stcu.analysis_currency
				from public.waterproof_reports_wbptap wp 
				inner join public.waterproof_treatment_plants_element e
				on (wp.element_id = e.id)
				left join public.waterproof_treatment_plants_function f
				on (e.element_graph_id=f.function_graph_id and e.element_plant_id=f.function_plant_id)
				left join  				
						  (select CPT.studycases_id ,Q.currency, Q.value,CS.analysis_currency,PT.function_currency, 
							Q.value TasaDecambio,PT.id, PT.function_graph_id 
							from public.waterproof_study_cases_studycases_currency Q
							inner join public.waterproof_study_cases_studycases_ptaps CPT on (Q.studycase_id=CPT.studycases_id)
							inner join public.waterproof_treatment_plants_function PT on (CPT.header_id=PT.function_plant_id)
							inner join public.waterproof_study_cases_studycases CS on (CPT.studycases_id=CS.id)
							where studycase_id = caseStudyId) stcu 
							on (f.id = stcu.id)
				where wp.studycase_id = caseStudyId
				and stage = varStage 
				-- and f.function_value is not null
				--and f.function_currency::varchar=stcu.currency::varchar
				)		
	
--
CREATE FUNCTION public.__wp_get_function_cost_study_cases_custom(casestudyid integer, varstage text) RETURNS TABLE("yearA" integer, elementa integer, currencymoneycosta text, global_multiplier_factora double precision, stagea character varying, awya double precision, q_l_sa double precision, cn_mg_la double precision, cp_mg_la double precision, csed_mg_la double precision, wn_kga double precision, wp_kga double precision, wsed_tona double precision, wn_ret_kga double precision, wp_ret_tona double precision, wsed_ret_tona double precision, functioncosa text, graphida integer, type_desca text, funcion_ida integer, intake_ptap_id integer, ratio_changea double precision)
    LANGUAGE plpgsql
    AS $$
begin
return query 
select wi.year, wi.element, sc.fn_currency_name::TEXT,sc.fn_factor, wi.stage,  wi.awy,3.170979198364586504312531709792e-5*wi.q_l_s as q_l_s,
wi.cn_mg_l,wi.cp_mg_l,wi.csed_mg_l,wi.wn_kg,wi.wp_kg,wi.wsed_ton,wi.wn_ret_kg,wi.wp_ret_ton,wi.wsed_ret_ton,sc.fn_value::TEXT,elt."graphId",
'intake' as type_desc, sc.fn_id::integer, wi.water_intake, COALESCE (wscsc.value , 1)::double precision as ratio_change
from (select row_number() over (order by id) as fn_id, a.* from (select id, 
json_array_elements(cost_functions::json)->'function'->>'elementSystemId' as fn_csInfraId,
cast(json_array_elements(to_json(cost_functions::json))->'function'->>'factor' as DOUBLE PRECISION) as fn_factor,
json_array_elements(cost_functions::json)->'function'->>'value' as fn_value, 
json_array_elements(cost_functions::json)->'function'->>'currencyCost' as fn_currency,
json_array_elements(cost_functions::json)->'function'->>'currencyCostName' as fn_currency_name,
json_array_elements(cost_functions::json)->'function'->>'elementSystemId' as fn_element_system_id
from waterproof_study_cases_studycases where id = casestudyid) a ) sc 
left join waterproof_reports_wbintake wi on (sc.id = wi.studycase_id)
left join waterproof_intake_elementsystem elt on (wi.element=elt.id)
left join waterproof_study_cases_studycases_currency wscsc on sc.id = wscsc.studycase_id
where sc.id=casestudyid and wi.stage = varstage and wi.element = sc.fn_element_system_id::integer; 
end;
$$;


--
-- Name: __wp_get_nbs_budget(integer[], integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_nbs_budget(listnbs integer[], id_case integer) RETURNS TABLE(name character varying, unit_implementation_cost numeric, unit_maintenance_cost numeric, id integer, unit_oportunity_cost numeric, periodicity_maitenance integer, value numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query 
			select nbs.slug as name,nbs.unit_implementation_cost, nbs.unit_maintenance_cost,nbs.id,nbs.unit_oportunity_cost,nbs.periodicity_maitenance,sc_nbs.value
				from waterproof_nbs_ca_waterproofnbsca nbs
				join waterproof_study_cases_studycases_nbs sc_nbs on sc_nbs.nbs_id=nbs.id AND sc_nbs.studycase_id=id_case
				where nbs.id = ANY(listnbs);
    END;
$$;


--
-- Name: __wp_get_nbs_budget_fastflood(integer[], integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_nbs_budget_fastflood(listnbs integer[], id_case integer) RETURNS TABLE(name character varying, unit_implementation_cost numeric, unit_maintenance_cost numeric, id integer, unit_oportunity_cost numeric, periodicity_maitenance integer, value numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query 
			select nbs.slug as name,nbs.unit_implementation_cost, nbs.unit_maintenance_cost,nbs.id,nbs.unit_oportunity_cost,nbs.periodicity_maitenance,sc_nbs.value
				from waterproof_nbs_ca_waterproofnbsca nbs
				join waterproof_fastflood_studycases_nbs sc_nbs on sc_nbs.nbs_id=nbs.id AND sc_nbs.studycase_id=id_case
				where nbs.id = ANY(listnbs);
    END;
$$;


--
-- Name: __wp_get_nbs_transformations(integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_nbs_transformations(listnbs integer[]) RETURNS TABLE(from_lucode integer, from_cob character varying, to_lucode integer, to_cob character varying, from_nbs character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select from_lulc.lucode as from_lucode,ra.name as from_cob,to_lulc.lucode  as to_lucode, rtrans.name as to_cob,nbs.slug as from_nbs
						from waterproof_nbs_ca_waterproofnbsca nbs
						join waterproof_nbs_ca_waterproofnbsca_rios_transformations rt on nbs.id = rt.waterproofnbsca_id
						join waterproof_nbs_ca_riostransformation rtrans on rt.riostransformation_id = rtrans.id
						join waterproof_nbs_ca_riosactivity ra on ra.id = rtrans.activity_id
						join waterproof_pr_lulc from_lulc on ra.lucode = from_lulc.lucode
						join waterproof_pr_lulc to_lulc on rtrans.lucode = to_lulc.lucode
						where nbs.id =ANY(listNbs) ;
    END;
$$;


--
-- Name: __wp_get_ptap_catchments_by_studycase(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_ptap_catchments_by_studycase(idcase integer) RETURNS TABLE(id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query SELECT intakeElement.intake_id FROM waterproof_study_cases_studycases_ptaps studyPtap 
			JOIN waterproof_treatment_plants_csinfra ptapCsinfra ON ptapCsinfra.csinfra_plant_id=studyPtap.header_id
			JOIN waterproof_intake_elementsystem intakeElement ON intakeElement.id=ptapCsinfra.csinfra_elementsystem_id
			WHERE studyPtap.studycases_id=idcase;
    END;
$$;


--
-- Name: __wp_get_studycase_budget(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_studycase_budget(idcase integer) RETURNS TABLE(analysis_type character varying, time_implement integer, annual_investment numeric, rellocated_remainder boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select budget.analysis_type,budget.time_implement,budget.annual_investment,budget.rellocated_remainder
			from waterproof_study_cases_studycases budget WHERE budget.id=idcase;	
    END;
$$;


--
-- Name: __wp_get_studycase_budget_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_studycase_budget_fastflood(idcase integer) RETURNS TABLE(analysis_type character varying, time_implement integer, annual_investment numeric, rellocated_remainder boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query 
			select sc.analysis_type, sc.time_implement, sc.annual_investment, sc.rellocated_remainder
			from 
				waterproof_fastflood_studycases sc
			WHERE id=idcase;	
    END;
$$;


--
-- Name: __wp_get_studycase_catchments(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_studycase_catchments(idcase integer) RETURNS TABLE(id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select catchment.intake_id
			from waterproof_study_cases_studycases_intakes catchment WHERE studycases_id=idcase;	
    END;
$$;


--
-- Name: __wp_get_studycase_nbs(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_studycase_nbs(idcase integer) RETURNS TABLE(id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select nbs.nbs_id
			from waterproof_study_cases_studycases_nbs nbs WHERE studycase_id=idcase;	
    END;
$$;


--
-- Name: __wp_get_studycase_nbs_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_studycase_nbs_fastflood(idcase integer) RETURNS TABLE(id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select nbs.nbs_id
			from waterproof_fastflood_studycases_nbs nbs WHERE studycase_id=idcase;	
    END;
$$;


--
-- Name: __wp_get_studycase_objective(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_studycase_objective(idcase integer) RETURNS TABLE(obj_id integer, obj_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query SELECT  all_objectives.id as obj_id ,all_objectives.name as obj_name FROM public.waterproof_study_cases_studycases_portfolios sc_objectives
			join waterproof_study_cases_portfolio all_objectives on sc_objectives.portfolio_id=all_objectives.id
			WHERE sc_objectives.studycases_id=idcase;
    END;
$$;


--
-- Name: __wp_get_studycase_objective_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_studycase_objective_fastflood(case_id integer) RETURNS TABLE(obj_id integer, obj_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query SELECT all_objectives.id as obj_id ,all_objectives.name as obj_name 
			FROM public.waterproof_fastflood_studycases_portfolios sc_objectives
			join waterproof_study_cases_portfolio all_objectives on sc_objectives.portfolio_id=all_objectives.id
			WHERE sc_objectives.studycases_id = case_id;
    END;
$$;


--
-- Name: __wp_get_studycase_watersheds(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_studycase_watersheds(case_id integer) RETURNS TABLE(id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select wfsw.watershed_id
			from waterproof_fastflood_studycases_watershed wfsw WHERE studycases_id=case_id;	
    END;
$$;


--
-- Name: __wp_get_user_objectives_priorities(integer, integer, integer, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_user_objectives_priorities(objective integer, transition_id integer, parameter_value integer, intake_value integer, user_value integer, studycase_id integer) RETURNS TABLE(priority_value character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
		RETURN QUERY SELECT priorit.value as priority_value
			FROM waterproof_parameters_objetives_priorities priorit WHERE priorit.model=objective AND priorit.transition=transition_id AND priorit.parameter=parameter_value 
			AND priorit.default='N' AND priorit.intake_id=intake_value AND priorit.user_id=user_value AND priorit.study_case_id=studyCase_id;	
    END;
$$;


--
-- Name: __wp_get_user_transitions_priorities(integer, integer, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_user_transitions_priorities(objective integer, transition_id integer, intake_value integer, user_value integer, studycase_id integer) RETURNS TABLE(priority_value character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
		RETURN QUERY SELECT priorit.value as priority_value
			FROM waterproof_parameters_transitions_priorities priorit WHERE priorit.model=objective AND priorit.transition=transition_id AND priorit.default='N'
			AND priorit.intake_id=intake_value AND priorit.user_id=user_value AND priorit.study_case_id=studyCase_id;	
    END;
$$;


--
-- Name: __wp_get_watershed_basin(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_get_watershed_basin(ws_id integer) RETURNS TABLE(id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select basin.basin_id
			from waterproof_fastflood_polygon basin WHERE watershed_id = ws_id;	
    END;
$$;


--
-- Name: __wp_getallbasins(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_getallbasins() RETURNS TABLE(id numeric, continent character varying, symbol character varying, code numeric, label character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select b.id, b.continent, b.symbol, b.code,b.label
			from waterproof_intake_basins b;	
    END;
$$;


--
-- Name: __wp_getbasin(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_getbasin(idbasin integer) RETURNS TABLE(id numeric, continent character varying, symbol character varying, code numeric, label character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select b.id, b.continent, b.symbol, b.code,b.label
			from waterproof_intake_basins b
			where b.id = idbasin;	
    END;
$$;


--
-- Name: __wp_getbasinbylabel(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_getbasinbylabel(labelbasin character varying) RETURNS TABLE(id numeric, continent character varying, symbol character varying, code numeric, label character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select b.id, b.continent, b.symbol, b.code,b.label
			from waterproof_intake_basins b
			where b.label = labelBasin;	
    END;
$$;


--
-- Name: __wp_getconstant(integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_getconstant(idbasin integer, constantname character varying) RETURNS TABLE(id_constant integer, name character varying, value character varying, id_basin integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select *
			from waterproof_pr_constants c
			where c.id_basin = idbasin
			and c.name = constantname;
    END;
$$;


--
-- Name: __wp_getcsinfra(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_getcsinfra(cs_id integer) RETURNS TABLE(id integer, name character varying, nitrogen numeric, normalized_category character varying, phosporus numeric, sediment numeric, intake_id integer, q_l_s double precision, awy double precision, cn_mg_l double precision, cp_mg_l double precision, csed_mg_l double precision, wn_kg double precision, wn_ret_kg double precision, wp_ret_ton double precision, wsed_ret_ton double precision, wsed_ton double precision, wp_kg double precision, graphid integer, transported_water numeric, is_external boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select es.id, es.name, es.nitrogen,es.normalized_category,es.phosphorus,
		es.sediment,es.intake_id,es.q_l_s,es.awy,es.cn_mg_l,es.cp_mg_l,es.csed_mg_l,es.wn_kg,
		es.wn_ret_kg,es.wp_ret_ton,es.wsed_ret_ton,es.wsed_ton,es.wp_kg,es."graphId",es.transported_water,
		es.is_external
			from waterproof_intake_elementsystem es
			where es.normalized_category = 'CSINFRA'
			and es.id = cs_id;
    END;
$$;


--
-- Name: __wp_getobjectives(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_getobjectives(idobj integer) RETURNS TABLE(name character varying, id_obj integer)
    LANGUAGE plpgsql
    AS $$    BEGIN
		return query 
			select objective_alias,id_objective
				from waterproof_pr_objectives obj
				where id_objective = idobj;
    END;
    $$;


--
-- Name: __wp_getparameterbyname(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_getparameterbyname(name_parameter character varying) RETURNS TABLE(id_tipo_parametro integer, nombre character varying, cut boolean, constant boolean, suffix boolean, empty boolean, file boolean, folder boolean, out_path boolean, calc boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select p.id_tipo_parametro, p.nombre, p.cut,p.constant,p.suffix,p.empty,p.file,p.folder,
			p.out_path,p.calc
			from waterproof_tbl_pr_parametro p
			where p.nombre = name_parameter;
    END;
$$;


--
-- Name: __wp_getparametersbymodel(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_getparametersbymodel(model_name character varying) RETURNS TABLE(id_tipo_parametro integer, nombre character varying, cut boolean, constant boolean, suffix boolean, empty boolean, file boolean, folder boolean, out_path boolean, calc boolean, input_user boolean, biophysical_parameters boolean, from_preproc boolean, rios_type character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select p.id_tipo_parametro, p.nombre,p.cut, p.constant,p.suffix,p.empty,p.file,
				p.folder,p.out_path,p.calc,p.inputuser,p.biophysical_parameters,p.from_preproc,p.rios_type
				from waterproof_pr_parametro p inner join
				waterproof_pr_parameter_model pm on p.id_tipo_parametro = pm.id_parameter
				inner join waterproof_pr_models m on pm.id_model = m.id_modelo
				where m.nombre = model_name;
    END;
$$;


--
-- Name: __wp_getparametersbyobj(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_getparametersbyobj(idbasin integer, idobj integer) RETURNS TABLE(nombre character varying, basin integer, ruta character varying, id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query 
			select p.nombre,pr.id_basin,pr.ruta,p.id_tipo_parametro
				from waterproof_pr_parameter_objective po
				join waterproof_pr_parametro p on po.id_parameter = p.id_tipo_parametro
				join waterproof_pr_parametro_ruta pr on p.id_tipo_parametro = pr.id_parametro
				where id_objective = idobj and pr.id_basin = idbasin;
    END;
$$;


--
-- Name: __wp_getparametersmodel(integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_getparametersmodel(idbasin integer, model character varying) RETURNS TABLE(name character varying, ruta character varying, cut boolean, constant boolean, suffix boolean, empty boolean, file boolean, folder boolean, out_path boolean, out_folder character varying, out_folder_quality character varying, calc boolean, inputuser boolean, biophysical_parameters boolean, from_preproc boolean, rios_type character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
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
$$;


--
-- Name: __wp_getpathbasinparameter(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_getpathbasinparameter(idbasin integer, id_parameter integer) RETURNS TABLE(path character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select ruta
			from waterproof_pr_parametro_ruta
			where id_basin = idBasin and id_parametro = id_parameter;	
    END;
$$;


--
-- Name: __wp_gettransformationsbyid(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_gettransformationsbyid(nbs_id integer) RETURNS TABLE(from_lucode integer, from_cob character varying, to_lucode integer, to_cob character varying)
    LANGUAGE plpgsql
    AS $$    BEGIN
		return query select from_lulc.lucode as from_lucode,ra.name as from_cob,to_lulc.lucode  as to_lucode, rtrans.name as to_cob
						from waterproof_nbs_ca_waterproofnbsca nbs
						join waterproof_nbs_ca_waterproofnbsca_rios_transformations rt on nbs.id = rt.waterproofnbsca_id
						join waterproof_nbs_ca_riostransformation rtrans on rt.riostransformation_id = rtrans.id
						join waterproof_nbs_ca_riosactivity ra on ra.id = rtrans.activity_id
						join waterproof_pr_lulc from_lulc on ra.lucode = from_lulc.lucode
						join waterproof_pr_lulc to_lulc on rtrans.lucode = to_lulc.lucode
						where nbs.id = nbs_id;
    END;
    $$;


--
-- Name: __wp_gettransformationsbyname(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_gettransformationsbyname(nbs_name character varying) RETURNS TABLE(from_lucode integer, from_cob character varying, to_lucode integer, to_cob character varying)
    LANGUAGE plpgsql
    AS $$    BEGIN
		return query select from_lulc.lucode as from_lucode,ra.name as from_cob,to_lulc.lucode  as to_lucode, rtrans.name as to_cob
						from waterproof_nbs_ca_waterproofnbsca nbs
						join waterproof_nbs_ca_waterproofnbsca_rios_transformations rt on nbs.id = rt.waterproofnbsca_id
						join waterproof_nbs_ca_riostransformation rtrans on rt.riostransformation_id = rtrans.id
						join waterproof_nbs_ca_riosactivity ra on ra.id = rtrans.activity_id
						join waterproof_pr_lulc from_lulc on ra.lucode = from_lulc.lucode
						join waterproof_pr_lulc to_lulc on rtrans.lucode = to_lulc.lucode
						where nbs.slug = nbs_name;
    END;
    $$;


--
-- Name: __wp_gettransitions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_gettransitions() RETURNS TABLE(name character varying, file_name character varying, transition_type character varying, id_transition character varying, label character varying, id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query 
			select nbs.name,nbs.file_name, nbs.transition_type,nbs.id_transition,
			nbs.label,nbs.id
				from waterproof_nbs_ca_riostransition nbs;
    END;
$$;


--
-- Name: __wp_indicators_insert(integer, character varying, character varying, date, double precision, double precision, double precision, double precision, double precision, double precision, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_indicators_insert(time_in integer, type_in character varying, path_in character varying, date_in date, awy_in double precision, wn_in double precision, wp_in double precision, wsed_in double precision, bf_in double precision, wc_in double precision, intake_id_in integer, study_case_id_in integer, user_id_in integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO public.waterproof_reports_investindicators (
			time,type,path,date,awy,wn_kg,wp_kg,wsed_ton,bf_m3,wc_ton,intake_id,study_case_id,user_id) 
			VALUES (time_in,type_in,path_in,date_in,awy_in,wn_in,wp_in,wsed_in,bf_in,wc_in,intake_id_in,study_case_id_in,user_id_in);
    END;
$$;


--
-- Name: __wp_indicators_insert_fastflood(integer, character varying, character varying, date, double precision, double precision, double precision, double precision, double precision, double precision, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_indicators_insert_fastflood(time_in integer, type_in character varying, path_in character varying, date_in date, awy_in double precision, wn_in double precision, wp_in double precision, wsed_in double precision, bf_in double precision, wc_in double precision, intake_id_in integer, study_case_id_in integer, user_id_in integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO public.waterproof_reports_investindicators_fastflood (
			time,type,path,date,awy,wn_kg,wp_kg,wsed_ton,bf_m3,wc_ton,intake_id,study_case_id,user_id) 
			VALUES (time_in,type_in,path_in,date_in,awy_in,wn_in,wp_in,wsed_in,bf_in,wc_in,intake_id_in,study_case_id_in,user_id_in);
    END;
$$;


--
-- Name: __wp_insert_disaggregation(integer, character varying, integer, integer, double precision, double precision, double precision, double precision, double precision, double precision); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_insert_disaggregation(time_in integer, stage_in character varying, intake_id_in integer, study_case_id_in integer, awy_in double precision, wsed_in double precision, wn_in double precision, wp_in double precision, bf_in double precision, wc_in double precision) RETURNS void
    LANGUAGE plpgsql
    AS $$
	BEGIN

			insert into public.waterproof_reports_desagregation("time",stage,intake_id,study_case_id,"AWY(m3)","Wsed(Ton)","WN(Kg)","WP(kg)","BF(m3)","WC(Ton)")
			values("time_in",stage_in,intake_id_in,study_case_id_in,awy_in,wsed_in,wn_in,wp_in,bf_in,wc_in);
	END;
$$;


--
-- Name: __wp_insert_disaggregation_fastflood(integer, character varying, integer, integer, double precision, double precision, double precision, double precision, double precision, double precision); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_insert_disaggregation_fastflood(time_in integer, stage_in character varying, intake_id_in integer, study_case_id_in integer, awy_in double precision, wsed_in double precision, wn_in double precision, wp_in double precision, bf_in double precision, wc_in double precision) RETURNS void
    LANGUAGE plpgsql
    AS $$
	BEGIN

			insert into public.waterproof_reports_desagregation_fastflood("time",stage,intake_id,study_case_id,"AWY(m3)","Wsed(Ton)","WN(Kg)","WP(kg)","BF(m3)","WC(Ton)")
			values("time_in",stage_in,intake_id_in,study_case_id_in,awy_in,wsed_in,wn_in,wp_in,bf_in,wc_in);
	END;
$$;


--
-- Name: __wp_insert_log(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_insert_log(route_in character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
		INSERT INTO waterproof_reports_zip (link_log) VALUES (route_in );
END;
$$;


--
-- Name: __wp_insert_rios_report(integer, character varying, double precision, double precision, double precision, date, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_insert_rios_report(year integer, sbn character varying, actual_spent double precision, total_budget double precision, area_converted_ha double precision, execution_date date, intake_id integer, study_case_id integer, user_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO waterproof_reports_rios_ipa (
			year,sbn,actual_spent,total_budget,
			area_converted_ha, execution_date, intake_id, study_case_id, user_id) 
			VALUES (year,sbn,actual_spent,total_budget,
			area_converted_ha, execution_date, intake_id, study_case_id, user_id);
    END;
$$;


--
-- Name: __wp_insert_rios_report_fastflood(integer, character varying, double precision, double precision, double precision, date, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_insert_rios_report_fastflood(year integer, sbn character varying, actual_spent double precision, total_budget double precision, area_converted_ha double precision, execution_date date, intake_id integer, study_case_id integer, user_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO waterproof_reports_rios_ipa_fastflood (
			year,sbn,actual_spent,total_budget,
			area_converted_ha, execution_date, intake_id, study_case_id, user_id) 
			VALUES (year,sbn,actual_spent,total_budget,
			area_converted_ha, execution_date, intake_id, study_case_id, user_id);
    END;
$$;


--
-- Name: __wp_insertconcentrationsinvest(integer, character varying, double precision, double precision, double precision, double precision, double precision, double precision, double precision); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_insertconcentrationsinvest(id_intake integer, elementtype character varying, awy_m double precision, wsed double precision, wn double precision, wp double precision, csed double precision, cn double precision, cp double precision) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
		UPDATE WATERPROOF_INTAKE_ELEMENTSYSTEM es
		   SET   (awy, wsed_ton, wn_kg, wp_kg, csed_mg_l, cn_mg_l, cp_mg_l) = (awy_m,wsed,wn,wp,csed,cn,cp)
		   WHERE  es.intake_id = id_intake and normalized_category = elementType;
    END;
$$;


--
-- Name: __wp_intake_emptycols(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_intake_emptycols(element_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
execute format('UPDATE public.waterproof_intake_elementsystem 
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
$$;


--
-- Name: __wp_intake_insert_report(double precision, integer, integer, integer, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_intake_insert_report(element_id double precision, intake_id integer, year integer, user_id integer, awy double precision, cn_mg_l double precision, cp_mg_l double precision, csed_mg_l double precision, wn_kg double precision, wp_kg double precision, wsed_ton double precision, wn_ret_kg double precision, wp_ret_kg double precision, wsed_ret_ton double precision, study_case_id integer, scenario character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO waterproof_reports_wbintake (
			stage,water_intake,element,year,awy,q_l_s,
			cn_mg_l, cp_mg_l, csed_mg_l, wn_kg, wp_kg,
			wsed_ton, wn_ret_kg, wp_ret_ton, wsed_ret_ton, studycase_id ,user_id) 
			VALUES (scenario,intake_id,element_id,year,awy,awy,
			cn_mg_l, cp_mg_l, csed_mg_l, wn_kg, wp_kg,
			wsed_ton, wn_ret_kg, wp_ret_kg, wsed_ret_ton, study_case_id,user_id);
    END;
$$;


--
-- Name: __wp_intersectmacroregionfromcoords(double precision, double precision); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_intersectmacroregionfromcoords(x double precision, y double precision) RETURNS TABLE(id_macroregion integer)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: __wp_invest_result_insert(integer, character varying, double precision, double precision, double precision, double precision, double precision, double precision, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_invest_result_insert(year integer, model_type character varying, awy double precision, wn_kg double precision, wp_kg double precision, wsed_ton double precision, bf_m3 double precision, wc_ton double precision, intake_id integer, study_case_id integer, user_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
	INSERT INTO public.waterproof_reports_invest_results
	("year", "type", awy, wn_kg, wp_kg, wsed_ton, bf_m3, wc_ton, execution_date, intake_id, study_case_id, user_id)
	VALUES(year, model_type, awy , wn_kg, wp_kg, wsed_ton, bf_m3, wc_ton, current_date, intake_id, study_case_id, user_id);
    END;
$$;


--
-- Name: __wp_invest_result_insert_fastflood(integer, character varying, double precision, double precision, double precision, double precision, double precision, double precision, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_invest_result_insert_fastflood(year integer, model_type character varying, awy double precision, wn_kg double precision, wp_kg double precision, wsed_ton double precision, bf_m3 double precision, wc_ton double precision, intakeid integer, studycaseid integer, user_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN		
    INSERT INTO public.waterproof_reports_invest_results_fastflood
	("year", "type", awy, wn_kg, wp_kg, wsed_ton, bf_m3, wc_ton, execution_date, intake_id, study_case_id, user_id)
	VALUES(year, model_type, awy , wn_kg, wp_kg, wsed_ton, bf_m3, wc_ton, current_date, intakeId, studyCaseId, user_id);
    END;
$$;


--
-- Name: __wp_log_insert(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_log_insert(studycase_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN			
	delete from public.waterproof_reports_log where study_case_id = studycase_id;
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 1, 'STEP 1 of 14', null);
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 2, 'STEP 2 of 14', null);
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 3, 'STEP 3 of 14', null);
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 4, 'STEP 4 of 14', null);
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 5, 'STEP 5 of 14', null);
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 6, 'STEP 6 of 14', null);
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 7, 'STEP 7 of 14', null);
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 8, 'STEP 8 of 14', null);
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 9, 'STEP 9 of 14', null);
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 10, 'STEP 11 of 14', null);
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 11, 'STEP 11 of 14', null);
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 12, 'STEP 12 of 14', null);
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 13, 'STEP 13 of 14', null);
	INSERT INTO public.waterproof_reports_log (study_case_id, step_id, step, status) values (studycase_id, 14, 'STEP 14 of 14', null);
    END;
$$;


--
-- Name: __wp_log_insert_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_log_insert_fastflood(studycase_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN			
	delete from public.waterproof_reports_log_fastflood where study_case_id = studycase_id;
	INSERT INTO public.waterproof_reports_log_fastflood (study_case_id, step_id, step, status) values (studycase_id, 1, 'STEP 1 of 12', null);
	INSERT INTO public.waterproof_reports_log_fastflood (study_case_id, step_id, step, status) values (studycase_id, 2, 'STEP 2 of 12', null);
	INSERT INTO public.waterproof_reports_log_fastflood (study_case_id, step_id, step, status) values (studycase_id, 3, 'STEP 3 of 12', null);
	INSERT INTO public.waterproof_reports_log_fastflood (study_case_id, step_id, step, status) values (studycase_id, 4, 'STEP 4 of 12', null);
	INSERT INTO public.waterproof_reports_log_fastflood (study_case_id, step_id, step, status) values (studycase_id, 5, 'STEP 5 of 12', null);
	INSERT INTO public.waterproof_reports_log_fastflood (study_case_id, step_id, step, status) values (studycase_id, 6, 'STEP 6 of 12', null);
	INSERT INTO public.waterproof_reports_log_fastflood (study_case_id, step_id, step, status) values (studycase_id, 7, 'STEP 7 of 12', null);
	INSERT INTO public.waterproof_reports_log_fastflood (study_case_id, step_id, step, status) values (studycase_id, 8, 'STEP 8 of 12', null);
	INSERT INTO public.waterproof_reports_log_fastflood (study_case_id, step_id, step, status) values (studycase_id, 9, 'STEP 9 of 12', null);
	INSERT INTO public.waterproof_reports_log_fastflood (study_case_id, step_id, step, status) values (studycase_id, 10, 'STEP 11 of 12', null);
	INSERT INTO public.waterproof_reports_log_fastflood (study_case_id, step_id, step, status) values (studycase_id, 11, 'STEP 11 of 12', null);
	INSERT INTO public.waterproof_reports_log_fastflood (study_case_id, step_id, step, status) values (studycase_id, 12, 'STEP 12 of 12', null);

    END;
$$;


--
-- Name: __wp_ptap_get_data_intakes(integer, character varying, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_ptap_get_data_intakes(ptap_id integer, colfind character varying, scenario character varying) RETURNS TABLE(year integer, typecol double precision)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: __wp_ptap_get_data_intakes(integer, character varying, character varying, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_ptap_get_data_intakes(ptap_id integer, colfind character varying, scenario character varying, studycases_id_in integer) RETURNS TABLE(year integer, typecol double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
	return query 
	EXECUTE format(' 
		select
		ele.year,
		SUM (ele.%I) as typecol
		from public.waterproof_treatment_plants_csinfra csin
		join public.waterproof_reports_wbintake ele ON csin.csinfra_elementsystem_id = ele.element 
		where csin.csinfra_plant_id = %s and ele.stage = %L and ele.studycase_id=%s
		group by ele.year;', colfind, ptap_id, scenario,studycases_id_in );
END
$$;


--
-- Name: __wp_ptap_insert_report(double precision, integer, integer, integer, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_ptap_insert_report(element_id double precision, ptap_id integer, year integer, user_id integer, awy double precision, cn_mg_l double precision, cp_mg_l double precision, csed_mg_l double precision, wn_kg double precision, wp_kg double precision, wsed_ton double precision, wn_ret_kg double precision, wp_ret_kg double precision, wsed_ret_ton double precision, study_case_id integer, scenario character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO waterproof_reports_wbptap (
			stage,element_id,year,awy,
			cn_mg_l, cp_mg_l, csed_mg_l, wn_kg, wp_kg,
			wsed_ton, wn_ret_kg, wp_ret_kg, wsed_ret_ton, ptap_id, studycase_id, user_id ) 
			VALUES (scenario,element_id,year,awy,
			cn_mg_l, cp_mg_l, csed_mg_l, wn_kg, wp_kg,
			wsed_ton, wn_ret_kg, wp_ret_kg, wsed_ret_ton, ptap_id, study_case_id, user_id);
    END;
$$;


--
-- Name: __wp_ptap_normquality(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_ptap_normquality(csinfra_id integer) RETURNS TABLE(drinking_water_standard_code integer)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: __wp_reset_study_cases(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_reset_study_cases(case_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN	
	delete from waterproof_study_cases_currency_cost_calculated where studycase_id = case_id;
	delete from waterproof_reports_analysis_costs where study_case_id = case_id;
	delete from waterproof_reports_analysis_benefits where study_case_id = case_id;
	delete from waterproof_reports_result_cost_function where study_case_id = case_id;
	delete from waterproof_reports_vpn where study_case_id = case_id;
	delete from waterproof_report_result_roi where study_case_id = case_id;
	delete from waterproof_reports_investindicators where study_case_id = case_id;
	delete from waterproof_reports_desagregation where study_case_id = case_id;
	delete from waterproof_reports_invest_results where study_case_id = case_id;
	delete from waterproof_reports_wbptap where studycase_id = case_id;
	delete from waterproof_reports_wbintake where studycase_id = case_id;
	delete from waterproof_reports_rios_ipa rios where study_case_id = case_id;
END;
$$;


--
-- Name: __wp_reset_studycases_fastflood(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_reset_studycases_fastflood(studycaseid bigint) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		delete from waterproof_reports_invest_results_fastflood where study_case_id = studycaseId;
		delete from waterproof_reports_rios_ipa_fastflood where study_case_id = studycaseId;
		delete from waterproof_reports_investindicators_fastflood where study_case_id = studycaseId;
		delete from waterproof_reports_analysis_benefits_fastflood where study_case_id = studycaseId;
		delete  from waterproof_reports_analysis_costs_fastflood where study_case_id = studycaseId;
		delete  from waterproof_reports_desagregation_fastflood wrdf where study_case_id = studycaseId;
    END;
$$;


--
-- Name: __wp_restore_study_case(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_restore_study_case(case_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
	
delete from waterproof_study_cases_currency_cost_calculated where studycase_id = case_id;
delete from waterproof_reports_analysis_costs where study_case_id = case_id;
delete from waterproof_reports_analysis_benefits where study_case_id = case_id;
delete from waterproof_reports_result_cost_function where study_case_id = case_id;
delete from waterproof_reports_vpn where study_case_id = case_id;
delete from waterproof_report_result_roi where study_case_id = case_id;
delete from waterproof_reports_investindicators where study_case_id = case_id;
delete from waterproof_reports_desagregation where study_case_id = case_id;
delete from waterproof_reports_invest_results where study_case_id = case_id;
delete from waterproof_reports_wbptap where studycase_id = case_id;
delete from waterproof_reports_wbintake where studycase_id = case_id;
delete from waterproof_reports_rios_ipa rios where study_case_id = case_id;
			
end;
$$;


--
-- Name: __wp_roi_cost(integer, character varying, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_cost(studycase integer, type_in character varying, stages character varying) RETURNS TABLE(process_o integer, year_o integer, value_o double precision, function_o bigint)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: __wp_roi_financial_parameters_first(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_financial_parameters_first(studycase integer) RETURNS TABLE(costs character varying, values_out numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
   select
   t1.cost,
   t1.value
   from
	(select
			case cost 
			when 'Program Director (Cost/yr)' then 2
			when 'Finance and Administrator (Cost/yr)' then 4
			when 'Office Costs (Cost/yr)' then 6
			when 'Equipment (Cost/yr)' then 8
			when 'Overhead (Cost/yr)' then 10
			when 'Carbon Cost (USD/TonCO2)' then 1
			when 'Monitoring and Evaluation Manager (Cost/yr)' then 3
			when 'Implementation Manager (Cost/yr)' then 5
			when 'Travel (Cost/yr)' then 7
			when 'Contracts (Cost/yr)' then 9
			when 'Others (Cost/yr)' then 11
			end as orden,
			cost,
			value,
		 	studycase_id
		from
			waterproof_study_cases_currency_cost_calculated
			where type_or_id='Carbon' or type_or_id='Financial' and studycase_id = studycase) as t1
		where t1.studycase_id = studycase
		order by orden;
    END;
$$;


--
-- Name: __wp_roi_financial_parameters_first_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_financial_parameters_first_fastflood(studycase integer) RETURNS TABLE(costs character varying, values_out numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
   select
   t1.cost,
   t1.value
   from
	(select
			case cost 
			when 'Program Director (Cost/yr)' then 2
			when 'Finance and Administrator (Cost/yr)' then 4
			when 'Office Costs (Cost/yr)' then 6
			when 'Equipment (Cost/yr)' then 8
			when 'Overhead (Cost/yr)' then 10
			when 'Carbon Cost (USD/TonCO2)' then 1
			when 'Monitoring and Evaluation Manager (Cost/yr)' then 3
			when 'Implementation Manager (Cost/yr)' then 5
			when 'Travel (Cost/yr)' then 7
			when 'Contracts (Cost/yr)' then 9
			when 'Others (Cost/yr)' then 11
			end as orden,
			cost,
			value,
		 	studycase_id
		from
			waterproof_fastflood_currency_cost_calculated
			where type_or_id='Carbon' or type_or_id='Financial' and studycase_id = studycase) as t1
		where t1.studycase_id = studycase
		order by orden;
    END;
$$;


--
-- Name: __wp_roi_financial_parameters_second(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_financial_parameters_second(studycase integer) RETURNS TABLE(cost numeric, rate numeric, rate_min numeric, rate_max numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
select
		ROUND (transaction_cost/100,4) as transaction_cost,
		ROUND (discount_rate/100,4) as discount_rate,
		ROUND (discount_rate_minimunm/100,4) as discount_rate_minimunm,
		ROUND (discount_rate_maximum/100,4) as discount_rate_maximum
		from
		waterproof_study_cases_studycases
		where id=studycase;
    END;
$$;


--
-- Name: __wp_roi_financial_parameters_second_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_financial_parameters_second_fastflood(studycase integer) RETURNS TABLE(cost numeric, rate numeric, rate_min numeric, rate_max numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
select
		ROUND (transaction_cost/100,4) as transaction_cost,
		ROUND (discount_rate/100,4) as discount_rate,
		ROUND (discount_rate_minimunm/100,4) as discount_rate_minimunm,
		ROUND (discount_rate_maximum/100,4) as discount_rate_maximum
		from
		waterproof_fastflood_studycases
		where id=studycase;
    END;
$$;


--
-- Name: __wp_roi_insert_cost(character varying, bigint, double precision, bigint, character varying, date, character varying, double precision, double precision, double precision); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_insert_cost(currency_in character varying, serie_time_in bigint, value_in double precision, studycase bigint, cost_id_in character varying, date_in date, type_in character varying, vpn_min_cost_in double precision, vpm_max_cost_in double precision, vpn_med_cost_in double precision) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO waterproof_reports_analysis_costs (
			currency, time, value, study_case_id, cost_id, date_create, type, vpn_min_cost, vpm_max_cost, vpn_med_cost) 
			VALUES (currency_in, serie_time_in, value_in, studycase, cost_id_in, date_in, type_in,vpn_min_cost_in, vpm_max_cost_in, vpn_med_cost_in);
    END;
$$;


--
-- Name: __wp_roi_insert_cost_fastflood(character varying, bigint, double precision, bigint, character varying, date, character varying, double precision, double precision, double precision); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_insert_cost_fastflood(currency_in character varying, serie_time_in bigint, value_in double precision, studycase bigint, cost_id_in character varying, date_in date, type_in character varying, vpn_min_cost_in double precision, vpm_max_cost_in double precision, vpn_med_cost_in double precision) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO waterproof_reports_analysis_costs_fastflood (
			currency, time, value, study_case_id, cost_id, date_create, type, vpn_min_cost, vpm_max_cost, vpn_med_cost) 
			VALUES (currency_in, serie_time_in, value_in, studycase, cost_id_in, date_in, type_in,vpn_min_cost_in, vpm_max_cost_in, vpn_med_cost_in);
    END;
$$;


--
-- Name: __wp_roi_insert_save(character varying, bigint, double precision, integer, integer, date, character varying, double precision, double precision, double precision); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_insert_save(currency_in character varying, serie_time_in bigint, value_in double precision, element_id_in integer, studycase integer, date_in date, type_in character varying, vpn_min_cost_in double precision, vpm_max_cost_in double precision, vpn_med_cost_in double precision) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO waterproof_reports_analysis_benefits (
			currency, time, benefit_value, element_id, study_case_id, creation_date, type_id, vpn_min_benefit, vpn_max_benefit, vpn_med_benefit ) 
			VALUES (currency_in, serie_time_in, value_in, element_id_in, studycase, date_in, type_in,vpn_min_cost_in, vpm_max_cost_in, vpn_med_cost_in);
    END;
$$;


--
-- Name: __wp_roi_insert_save_fastflood(character varying, bigint, double precision, integer, integer, date, character varying, double precision, double precision, double precision); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_insert_save_fastflood(currency_in character varying, serie_time_in bigint, value_in double precision, element_id_in integer, studycase integer, date_in date, type_in character varying, vpn_min_cost_in double precision, vpm_max_cost_in double precision, vpn_med_cost_in double precision) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO waterproof_reports_analysis_benefits_fastflood (
			currency, time, benefit_value, element_id, study_case_id, creation_date, type_id, vpn_min_benefit, vpn_max_benefit, vpn_med_benefit ) 
			VALUES (currency_in, serie_time_in, value_in, element_id_in, studycase, date_in, type_in,vpn_min_cost_in, vpm_max_cost_in, vpn_med_cost_in);
    END;
$$;


--
-- Name: __wp_roi_insert_sensitivity(character varying, double precision, double precision, double precision, double precision, bigint, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_insert_sensitivity(currency_in character varying, total double precision, roi_w_dis double precision, roi_min double precision, roi_med double precision, studycase bigint, date_in date) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO waterproof_report_result_roi (
			currency,roi_without_discount, roi_minimum, roi_maximum, roi_medium, study_case_id,create_date ) 
			VALUES (currency_in,total,roi_w_dis,roi_min, roi_med,studycase, date_in);
    END;
$$;


--
-- Name: __wp_roi_insert_sensitivity_fastflood(character varying, double precision, double precision, double precision, double precision, bigint, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_insert_sensitivity_fastflood(currency_in character varying, total double precision, roi_w_dis double precision, roi_min double precision, roi_med double precision, studycase bigint, date_in date) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO waterproof_report_result_roi_fastflood (
			currency,roi_without_discount, roi_minimum, roi_maximum, roi_medium, study_case_id,create_date ) 
			VALUES (currency_in,total,roi_w_dis,roi_min, roi_med,studycase, date_in);
    END;
$$;


--
-- Name: __wp_roi_insert_vpn(character varying, double precision, double precision, double precision, double precision, double precision, double precision, double precision, bigint, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_insert_vpn(currency_in character varying, implemen_in double precision, main_in double precision, opor_in double precision, trans_in double precision, plat_in double precision, benet_in double precision, total_in double precision, studycase bigint, date_in date) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO waterproof_reports_vpn (
			currency,implementation,maintenance,oportunity,transaction,platform,benefit,total,study_case_id,date_execution ) 
			VALUES (currency_in,implemen_in,main_in,opor_in,trans_in,plat_in,benet_in,total_in,studycase, date_in);
    END;
$$;


--
-- Name: __wp_roi_insert_vpn_fastflood(character varying, double precision, double precision, double precision, double precision, double precision, double precision, double precision, bigint, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_insert_vpn_fastflood(currency_in character varying, implemen_in double precision, main_in double precision, opor_in double precision, trans_in double precision, plat_in double precision, benet_in double precision, total_in double precision, studycase bigint, date_in date) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		INSERT INTO waterproof_reports_vpn_fastflood (
			currency,implementation,maintenance,oportunity,transaction,platform,benefit,total,study_case_id,date_execution ) 
			VALUES (currency_in,implemen_in,main_in,opor_in,trans_in,plat_in,benet_in,total_in,studycase, date_in);
    END;
$$;


--
-- Name: __wp_roi_nbs_cost(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_nbs_cost(studycase_in integer) RETURNS TABLE(ids character varying, periodicity integer, costs character varying, values_out numeric)
    LANGUAGE plpgsql
    AS $$
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
        join waterproof_study_cases_currency_cost_calculated coc ON coc.type_or_id = cast(nbsca.id AS character varying)
    where coc.studycase_id=nbs.studycase_id and coc.studycase_id=studycase_in
    order by coc.type_or_id asc, coc.cost;
	
    END;
$$;


--
-- Name: __wp_roi_nbs_cost_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_nbs_cost_fastflood(studycase_in integer) RETURNS TABLE(ids character varying, periodicity integer, costs character varying, values_out numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select
        coc.type_or_id,
        nbsca.periodicity_maitenance,
        coc.cost,
        coc.value
    from
        waterproof_fastflood_studycases_nbs nbs
        join waterproof_nbs_ca_waterproofnbsca nbsca ON nbs.nbs_id = nbsca.id
        join waterproof_fastflood_currency_cost_calculated coc ON coc.type_or_id = cast(nbsca.id AS character varying)
    where coc.studycase_id=nbs.studycase_id and coc.studycase_id=studycase_in
    order by coc.type_or_id asc, coc.cost;
	
    END;
$$;


--
-- Name: __wp_roi_nbs_porfolio(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_nbs_porfolio(studycase integer) RETURNS TABLE(namesbn character varying, timeres integer, areares double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select
	    rios.sbn,
	    rios.year,
		sum(rios.area_converted_ha)
		from
		public.waterproof_reports_rios_ipa rios
		join public.waterproof_nbs_ca_waterproofnbsca nbsca on nbsca.slug = rios.sbn
		where rios.study_case_id=studycase and rios.year <999
		group by rios.sbn,rios.year
		order by rios.year,rios.sbn;	
    END;
$$;


--
-- Name: __wp_roi_nbs_porfolio_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_nbs_porfolio_fastflood(studycase integer) RETURNS TABLE(namesbn character varying, timeres integer, areares double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select
	    rios.sbn,
	    rios.year,
		sum(rios.area_converted_ha)
		from
		public.waterproof_reports_rios_ipa_fastflood rios
		join public.waterproof_nbs_ca_waterproofnbsca nbsca on nbsca.slug = rios.sbn
		where rios.study_case_id=studycase and rios.year <999
		group by rios.sbn,rios.year
		order by rios.year,rios.sbn;	
    END;
$$;


--
-- Name: __wp_roi_tc_carbon(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_carbon(studycase integer) RETURNS TABLE(currency character varying, valor numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select
		case
			when 
				benefit_carbon_market is true 
			then
				cm_currency
			else analysis_currency
		end as currency,
		case
			when 
				benefit_carbon_market is true 
			then
				cm_value
			else 0
		end as value
	from
	waterproof_study_cases_studycases  
	where id=studycase;
    END;
$$;


--
-- Name: __wp_roi_tc_carbon_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_carbon_fastflood(studycase integer) RETURNS TABLE(currency character varying, valor numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select
		case
			when 
				benefit_carbon_market is true 
			then
				cm_currency
			else analysis_currency
		end as currency,
		case
			when 
				benefit_carbon_market is true 
			then
				cm_value
			else 0
		end as value
	from
	waterproof_fastflood_studycases where id=studycase;
    END;
$$;


--
-- Name: __wp_roi_tc_cost_nbs(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_cost_nbs(studycase integer) RETURNS TABLE(id_nbs integer, unit_implementation_cost numeric, unit_maintenance_cost numeric, unit_oportunity_cost numeric, currency character varying, country character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select
	nbs.nbs_id,
	nbsca.unit_implementation_cost,
	nbsca.unit_maintenance_cost,
	nbsca.unit_oportunity_cost,
	countries.currency,
	countries2.iso3 
	from
	waterproof_study_cases_studycases cases
	join waterproof_study_cases_studycases_nbs nbs ON cases.id = nbs.studycase_id
	join waterproof_nbs_ca_waterproofnbsca nbsca ON nbs.nbs_id = nbsca.id
	join waterproof_parameters_countries countries ON nbsca.currency_id = countries.id
	join waterproof_parameters_countries countries2 ON nbsca.country_id = countries2.id
	where cases.id=studycase;
    END;
$$;


--
-- Name: __wp_roi_tc_cost_nbs_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_cost_nbs_fastflood(studycase integer) RETURNS TABLE(id_nbs integer, unit_implementation_cost numeric, unit_maintenance_cost numeric, unit_oportunity_cost numeric, currency character varying, country character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select
	nbs.nbs_id,
	nbsca.unit_implementation_cost,
	nbsca.unit_maintenance_cost,
	nbsca.unit_oportunity_cost,
	countries.currency,
	countries2.iso3 
	from
	waterproof_fastflood_studycases cases
	join waterproof_fastflood_studycases_nbs nbs ON cases.id = nbs.studycase_id
	join waterproof_nbs_ca_waterproofnbsca nbsca ON nbs.nbs_id = nbsca.id
	join waterproof_parameters_countries countries ON nbsca.currency_id = countries.id
	join waterproof_parameters_countries countries2 ON nbsca.country_id = countries2.id
	where cases.id=studycase;
    END;
$$;


--
-- Name: __wp_roi_tc_exchange_rate(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_exchange_rate(studycase integer) RETURNS TABLE(analysis_currency character varying, currency character varying, valor numeric)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: __wp_roi_tc_exchange_rate_exception(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_exchange_rate_exception(studycase integer) RETURNS TABLE(currency character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select analysis_currency from waterproof_study_cases_studycases where id=studycase;
    END;
$$;


--
-- Name: __wp_roi_tc_exchange_rate_exception_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_exchange_rate_exception_fastflood(studycase integer) RETURNS TABLE(currency character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select analysis_currency from waterproof_fastflood_studycases where id=studycase;
    END;
$$;


--
-- Name: __wp_roi_tc_exchange_rate_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_exchange_rate_fastflood(studycase integer) RETURNS TABLE(analysis_currency character varying, currency character varying, valor numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select
	cases.analysis_currency,
	curren.currency,
	curren.value
	from
	waterproof_fastflood_studycases cases
	join waterproof_fastflood_studycase_currency curren ON cases.id = curren.studycase_id
	where cases.id=studycase;
    END;
$$;


--
-- Name: __wp_roi_tc_financial_param(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_financial_param(studycase integer) RETURNS TABLE(currency character varying, director numeric, monitoring_man numeric, finance_man numeric, imp_man numeric, office_cost numeric, travel_in numeric, equip_purch numeric, contract numeric, overhe numeric, othe numeric)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: __wp_roi_tc_financial_param_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_financial_param_fastflood(studycase integer) RETURNS TABLE(currency character varying, director numeric, monitoring_man numeric, finance_man numeric, imp_man numeric, office_cost numeric, travel_in numeric, equip_purch numeric, contract numeric, overhe numeric, othe numeric)
    LANGUAGE plpgsql
    AS $$
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
	waterproof_fastflood_studycases
	where id=studycase;
    END;
$$;


--
-- Name: __wp_roi_tc_global_multi_factor(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_global_multi_factor(studycase integer) RETURNS TABLE(global_multi_factor numeric)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: __wp_roi_tc_global_multi_factor_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_global_multi_factor_fastflood(studycase integer) RETURNS TABLE(global_multi_factor numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select 
		global_multiplier_factor 
		from
		waterproof_fastflood_studycases cases
		join waterproof_parameters_cities cities on cases.City_id = cities.id
		join waterproof_parameters_countries country on cities.country_id = country.id
		where cases.id = studycase;
    END;
$$;


--
-- Name: __wp_roi_tc_insert(character varying, character varying, numeric, character varying, integer, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_insert(type_in character varying, cost_in character varying, value_in numeric, currency_in character varying, studycase_in integer, date_exec date) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
	INSERT INTO public.waterproof_study_cases_currency_cost_calculated(type_or_id,cost,value,currency,studycase_id,date_execution)
	VALUES(type_in,cost_in,value_in,currency_in,studycase_in,date_exec);
    END;
$$;


--
-- Name: __wp_roi_tc_insert_fastflood(character varying, character varying, numeric, character varying, integer, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_tc_insert_fastflood(type_in character varying, cost_in character varying, value_in numeric, currency_in character varying, studycase_in integer, date_exec date) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
	INSERT INTO public.waterproof_fastflood_currency_cost_calculated(type_or_id,cost,value,currency,studycase_id,date_execution)
	VALUES(type_in,cost_in,value_in,currency_in,studycase_in,date_exec);
    END;
$$;


--
-- Name: __wp_roi_time(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_time(studycase integer) RETURNS TABLE(timeres integer, imple integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select 
	analysis_period_value,
	time_implement
	from waterproof_study_cases_studycases 
	where id = studycase;
    END;
$$;


--
-- Name: __wp_roi_time_fastflood(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_roi_time_fastflood(studycase integer) RETURNS TABLE(timeres integer, imple integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  return query 
	select 
	analysis_period_value,
	time_implement
	from waterproof_fastflood_studycases 
	where id = studycase;
    END;
$$;


--
-- Name: __wp_update_intake_area_polygon(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wp_update_intake_area_polygon() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
	BEGIN				
		UPDATE waterproof_intake_polygon SET area = st_area(geom, true) where id = new.id;
	    return new;
    END;
$$;


--
-- Name: __wpget_nbs_data(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpget_nbs_data(study_cases_id integer) RETURNS TABLE(nbs_name text, time_max_benefit integer, benefit_t0 numeric, period integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select nbs.slug::text nbs_name, max_benefit_req_time time_max_benefit, profit_pct_time_inter_assoc::numeric(10,2) benefit_t0, analysis_period_value from 
						waterproof_study_cases_studycases sc 
						left join waterproof_study_cases_studycases_nbs sc_nbs
						on sc.id = sc_nbs.studycases_id 
						left join waterproof_nbs_ca_waterproofnbsca nbs
						on sc_nbs.waterproofnbsca_id = nbs.id
						where sc.id = study_cases_id;	
    END;
$$;


--
-- Name: __wpget_paths_climate_value(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpget_paths_climate_value(study_cases_id integer, catchment_id integer) RETURNS TABLE(id_path_parameter integer, id_basin integer, path character varying, id_parameter integer)
    LANGUAGE plpgsql
    AS $$
BEGIN		
		return query select p.id_parametro_ruta, p.id_basin, p.ruta, p.id_parametro from public.waterproof_pr_parametro_ruta p where id_parametro in (
						select id_tipo_parametro  from public.waterproof_pr_parametro where nombre like  '%' ||  (select c.name 
							from public.waterproof_study_cases_studycases s
							left join public.waterproof_parameters_climate_value c
							on s.climate_scenario_id  = c.id
							where s.id = study_cases_id and s.climate_scenario_id  is not null)) and p.id_basin = (select basin_id from waterproof_intake_polygon wip where intake_id=catchment_id);
    END;
$$;


--
-- Name: __wpget_paths_climate_value_fastflood(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpget_paths_climate_value_fastflood(study_cases_id integer, watershed_id integer) RETURNS TABLE(id_path_parameter integer, id_basin integer, path character varying, id_parameter integer)
    LANGUAGE plpgsql
    AS $$
BEGIN		
		return query select p.id_parametro_ruta, p.id_basin, p.ruta, p.id_parametro from public.waterproof_pr_parametro_ruta p where id_parametro in (
						select id_tipo_parametro  from public.waterproof_pr_parametro where nombre like  '%' ||  (select c.name 
							from public.waterproof_fastflood_studycases s
							left join public.waterproof_parameters_climate_value c
							on s.climate_scenario_id  = c.id
							where s.id = study_cases_id and s.climate_scenario_id  is not null)) and p.id_basin = 
							(select basin_id from waterproof_fastflood_polygon wip where watershed_id=watershed_id);
    END;
$$;


--
-- Name: __wpgetawybycatchment(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetawybycatchment(catchment_id integer) RETURNS TABLE(id_c integer, awy double precision)
    LANGUAGE plpgsql
    AS $$    BEGIN
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
    $$;


--
-- Name: __wpgetawybyptap(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetawybyptap(ptap_id integer) RETURNS TABLE(id_c integer, awy double precision)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: __wpgetnbycatchment(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetnbycatchment(catchment_id integer) RETURNS TABLE(id_c integer, n double precision)
    LANGUAGE plpgsql
    AS $$    BEGIN
		return query select es.id,
						case 
							when es.wn_kg is null then 0
							else es.wn_kg
						end as awy
						from waterproof_intake_elementsystem es
						where intake_id = catchment_id;	
    END;
    $$;


--
-- Name: __wpgetnbyptap(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetnbyptap(ptap_id integer) RETURNS TABLE(id_c integer, n double precision)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: __wpgetpbycatchment(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetpbycatchment(catchment_id integer) RETURNS TABLE(id_c integer, p double precision)
    LANGUAGE plpgsql
    AS $$    BEGIN
		return query select es.id,
						case 
							when es.wp_kg is null then 0
							else es.wp_kg
						end as awy
						from waterproof_intake_elementsystem es
						where intake_id = catchment_id;	
    END;
    $$;


--
-- Name: __wpgetpbyptap(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetpbyptap(ptap_id integer) RETURNS TABLE(id_c integer, p double precision)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: __wpgetpercentagesbycatchment(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetpercentagesbycatchment(catchment_id integer) RETURNS TABLE(from_element integer, pwater numeric, retsed numeric, retn numeric, retp numeric)
    LANGUAGE plpgsql
    AS $$    BEGIN
		return query select id as From_element,
transported_water as PWater,
sediment as RetSed,
nitrogen as RetN,
phosphorus as RetP
from waterproof_intake_elementsystem
where intake_id = catchment_id;	
    END;
    $$;


--
-- Name: __wpgetpercentagesbyptap(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetpercentagesbyptap(ptap_id integer) RETURNS TABLE(from_element integer, pwater numeric, retsed numeric, retn numeric, retp numeric)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: __wpgetqbycatchment(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetqbycatchment(catchment_id integer) RETURNS TABLE(element integer, year integer, value numeric)
    LANGUAGE plpgsql
    AS $$    BEGIN
		return query select es.id as element, q.year, q.value
from waterproof_intake_intake intake
join waterproof_intake_waterextraction q on intake.demand_parameters_id = q.demand_id
join waterproof_intake_elementsystem es on intake.id = es.intake_id and es.normalized_category = 'EXTRACTIONCONNECTION'
where intake.id = catchment_id and q.year = 1
order by q.year;
    END;
    $$;


--
-- Name: __wpgetqbycatchmentdis(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetqbycatchmentdis(catchment_id integer, studycases_in integer) RETURNS TABLE(element integer, year integer, value numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
	return query 
		select es.id as element, q.year as year, q.value as value
			from waterproof_intake_intake intake
			join waterproof_intake_waterextraction q on intake.demand_parameters_id = q.demand_id
			join waterproof_intake_elementsystem es on intake.id = es.intake_id and es.normalized_category = 'EXTRACTIONCONNECTION'
			where intake.id = catchment_id and q.year <= ((select analysis_period_value from public.waterproof_study_cases_studycases where id = studycases_in)+1)
			order by q.year;
    END;
$$;


--
-- Name: __wpgetqbyptap(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetqbyptap(ptap_id integer) RETURNS TABLE(element integer, value double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select es.id as element, es.element_q_l as value
		from waterproof_treatment_plants_element es 
		where es.element_plant_id = ptap_id and es.element_normalize_category='PTAP Input';
    END;
$$;


--
-- Name: __wpgetqbyptapdis(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetqbyptapdis(ptap_id integer) RETURNS TABLE(element integer, value double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select es.id as element, es.element_q_l as value
		from waterproof_treatment_plants_element es 
		where es.element_plant_id = ptap_id;
    END;
$$;


--
-- Name: __wpgetsedbycatchment(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetsedbycatchment(catchment_id integer) RETURNS TABLE(id_c integer, sed double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select es.id,
						case 
							when es.wsed_ton is null then 0
							else es.wsed_ton
						end as awy
						from waterproof_intake_elementsystem es
						where intake_id = catchment_id;	
    END;
$$;


--
-- Name: __wpgetsedbyptap(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgetsedbyptap(ptap_id integer) RETURNS TABLE(id_c integer, sed double precision)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: __wpgettopologybycatchment(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgettopologybycatchment(catchment_id integer) RETURNS TABLE(from_field integer, to_field integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select distinct target_t.source_id From_element, target_t.target_id To_Element
from waterproof_intake_elementsystem es
join waterproof_intake_elementconnections source_t on es.id = source_t.source_id
join waterproof_intake_elementconnections target_t on es.id = target_t.source_id
where es.intake_id = catchment_id;	
    END;
$$;


--
-- Name: __wpgettopologybyptap(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpgettopologybyptap(ptap_id integer) RETURNS TABLE(from_field integer, to_field integer)
    LANGUAGE plpgsql ROWS 10
    AS $$
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
$$;


--
-- Name: __wpinsert_download_zip(integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpinsert_download_zip(element_id_in integer, route_in character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
		INSERT INTO waterproof_reports_zip (study_case_id_id , link_log) VALUES (element_id_in , route_in );
END;
$$;


--
-- Name: __wpinsert_download_zip_fastflood(integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpinsert_download_zip_fastflood(case_id_in integer, route_in character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
		INSERT INTO waterproof_reports_zip_fastflood (study_case_id , link_log) VALUES (case_id_in , route_in );
END;
$$;


--
-- Name: __wpupdate_download_zip(integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpupdate_download_zip(element_id integer, route character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		UPDATE waterproof_reports_zip SET link = route WHERE study_case_id_id = element_id::int4;
END;
$$;


--
-- Name: __wpupdate_download_zip__(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpupdate_download_zip__() RETURNS void
    LANGUAGE sql
    AS $_$
CREATE OR REPLACE FUNCTION public.__wpupdate_download_zip(element_id integer,route character varying)
    RETURNS void
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $function$
BEGIN				
				EXECUTE format('UPDATE waterproof_study_Cases_studycases SET path_study_Case_error_log = %s WHERE id = %s',route,element_id);
END;
$function$;
$_$;


--
-- Name: __wpupdate_download_zip_fastflood(integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpupdate_download_zip_fastflood(case_id_in integer, route character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
		UPDATE waterproof_reports_zip_fastflood SET link = route WHERE study_case_id = case_id_in::int4;
END;
$$;


--
-- Name: __wpupdate_parameter(integer, character varying, double precision); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpupdate_parameter(element_id integer, parametername character varying, valueparameter double precision) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
				EXECUTE format('UPDATE waterproof_intake_elementsystem SET %I = %s WHERE id = %s',parametername,
							   valueParameter,
							  element_id);
    END;
$$;


--
-- Name: __wpupdate_parameter_ptap(integer, character varying, double precision); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.__wpupdate_parameter_ptap(element_id integer, parametername character varying, valueparameter double precision) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN				
				EXECUTE format('UPDATE waterproof_treatment_plants_element SET %I = %s WHERE id = %s',parametername,
							   valueParameter,
							  element_id);
    END;
$$;


--
-- Name: get_default_biophysycal_params(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_default_biophysycal_params(macro_value text, default_value text) RETURNS TABLE(lucode integer, lulc_desc text, description text, kc double precision, root_depth double precision, usle_c double precision, usle_p double precision, load_n double precision, eff_n double precision, load_p double precision, eff_p double precision, crit_len_n integer, crit_len_p integer, proportion_subsurface_n double precision, cn_a double precision, cn_b double precision, cn_c double precision, cn_d double precision, kc_1 double precision, kc_2 double precision, kc_3 double precision, kc_4 double precision, kc_5 double precision, kc_6 double precision, kc_7 double precision, kc_8 double precision, kc_9 double precision, kc_10 double precision, kc_11 double precision, kc_12 double precision, c_above double precision, c_below double precision, c_soil double precision, c_dead double precision, sed_exp double precision, sed_ret double precision, rough_rank double precision, cover_rank double precision, p_ret double precision, p_exp double precision, n_ret double precision, n_exp double precision, native_veg integer, lulc_veg integer, macro_region text, "default" text, id integer, intake_id integer, study_case_id integer, user_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select *
			from waterproof_parameters_biophysical param WHERE param.user_id=1000 AND param.macro_region=macro_value AND param.default=default_value;	
    END;
$$;


--
-- Name: get_user_biophysycal_params(text, text, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_biophysycal_params(macro_value text, default_value text, intake_value integer, study_case integer, user_value integer) RETURNS TABLE(lucode integer, lulc_desc text, description text, kc double precision, root_depth double precision, usle_c double precision, usle_p double precision, load_n double precision, eff_n double precision, load_p double precision, eff_p double precision, crit_len_n integer, crit_len_p integer, proportion_subsurface_n double precision, cn_a double precision, cn_b double precision, cn_c double precision, cn_d double precision, kc_1 double precision, kc_2 double precision, kc_3 double precision, kc_4 double precision, kc_5 double precision, kc_6 double precision, kc_7 double precision, kc_8 double precision, kc_9 double precision, kc_10 double precision, kc_11 double precision, kc_12 double precision, c_above double precision, c_below double precision, c_soil double precision, c_dead double precision, sed_exp double precision, sed_ret double precision, rough_rank double precision, cover_rank double precision, p_ret double precision, p_exp double precision, n_ret double precision, n_exp double precision, native_veg integer, lulc_veg integer, macro_region text, "default" text, id integer, intake_id integer, study_case_id integer, user_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select *
			from waterproof_parameters_biophysical param WHERE param.macro_region=macro_value AND param.default=default_value AND param.intake_id=intake_value AND param.study_case_id=study_case AND param.user_id=user_value; 
END;
$$;


--
-- Name: getactivities(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.getactivities(iduser integer) RETURNS TABLE(name character varying, unit_implementation_cost numeric, unit_maintenance_cost numeric)
    LANGUAGE plpgsql
    AS $$    BEGIN
		return query 
			select nbs.slug as name,nbs.unit_implementation_cost, nbs.unit_maintenance_cost
				from waterproof_nbs_ca_waterproofnbsca nbs
				where added_by_id = iduser;
    END;
    $$;


--
-- Name: getactivityshp(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.getactivityshp(iduser integer) RETURNS TABLE(id integer, activity character varying, action character varying, geom public.geometry)
    LANGUAGE plpgsql
    AS $$    BEGIN
		return query 					
				select shp.id,nbs.name,shp.action,shp.area
					from waterproof_nbs_ca_waterproofnbsca nbs
					join waterproof_nbs_ca_activityshapefile shp on nbs.activity_shapefile_id = shp.id
					where nbs.added_by_id = iduser;
    END;
    $$;


--
-- Name: getcasecatchments(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.getcasecatchments(idcase integer) RETURNS TABLE(id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
		return query select intake.id
			from waterproof_intake_intake intake WHERE intake.id=6 OR intake.id=9;	
    END;
$$;


--
-- Name: getcsinfra(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.getcsinfra(cs_id integer) RETURNS TABLE(id integer, name character varying, nitrogen numeric, normalized_category character varying, phosporus numeric, sediment numeric, intake_id integer, q_l_s double precision, awy double precision, cn_mg_l double precision, cp_mg_l double precision, csed_mg_l double precision, wn_kg double precision, wn_ret_kg double precision, wp_ret_ton double precision, wsed_ret_ton double precision, wsed_ton double precision, wp_kg double precision, graphid integer, transported_water numeric, is_external boolean)
    LANGUAGE plpgsql
    AS $$    BEGIN
		return query select es.id, es.name, es.nitrogen,es.normalized_category,es.phosphorus,
		es.sediment,es.intake_id,es.q_l_s,es.awy,es.cn_mg_l,es.cp_mg_l,es.csed_mg_l,es.wn_kg,
		es.wn_ret_kg,es.wp_ret_ton,es.wsed_ret_ton,es.wsed_ton,es.wp_kg,es."graphId",es.transported_water,
		es.is_external
			from waterproof_intake_elementsystem es
			where es.normalized_category = 'CSINFRA'
			and es.id = cs_id;
    END;
    $$;


--
-- Name: getcsinfras(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.getcsinfras(csinfras_array character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
tmp int;
BEGIN
    EXECUTE format('SELECT * FROM waterproof_intake_elementsystem WHERE ID IN (%s)'
                ,csinfras_array);
END
$$;


--
-- Name: getparametersmodel(integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.getparametersmodel(idbasin integer, model character varying) RETURNS TABLE(name character varying, ruta character varying, cut boolean, constant boolean, suffix boolean, empty boolean, file boolean, folder boolean, out_path boolean, out_folder character varying, out_folder_quality character varying, calc boolean, inputuser boolean, biophysical_parameters boolean, from_preproc boolean, rios_type character varying)
    LANGUAGE plpgsql
    AS $$    BEGIN
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
    $$;


--
-- Name: gettransitions(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.gettransitions(iduser integer) RETURNS TABLE(name character varying, file_name character varying, transition_type character varying, id_transition character varying, label character varying)
    LANGUAGE plpgsql
    AS $$    BEGIN
		return query 
			select nbs.name,nbs.file_name, nbs.transition_type,nbs.id_transition,
			nbs.label
				from waterproof_nbs_ca_riostransition nbs;
    END;
    $$;


SET default_with_oids = false;

--
-- Name: account_emailaddress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_emailaddress (
    id integer NOT NULL,
    email character varying(254) NOT NULL,
    verified boolean NOT NULL,
    "primary" boolean NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: account_emailaddress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.account_emailaddress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: account_emailaddress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.account_emailaddress_id_seq OWNED BY public.account_emailaddress.id;


--
-- Name: account_emailconfirmation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_emailconfirmation (
