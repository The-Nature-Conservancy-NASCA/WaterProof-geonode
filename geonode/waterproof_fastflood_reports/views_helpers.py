"""
Helper functions for FastFlood PDF generation
These functions obtain data directly from the database without making HTTP requests
"""
from django.db import connection
from django.conf import settings
import logging
import base64
import re
import os
import csv
import requests
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)

ARIAL = 'Arial'
map_send_image = 'imgpdf/map-send-image.png'


def get_conservation_activities_data(study_case_id):
    """Obtiene datos de actividades de conservación directamente de la base de datos"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_conservation_activities_fastflood_pdf(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "name": row[0],
                    "description": row[1],
                    "benefit": row[2],
                    "implementation": row[3],
                    "maintenance": row[4],
                    "periodicity": row[5],
                    "oportunity": row[6],
                    "profit_pct_time": row[7]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching conservation activities: {e}")
        return []


def get_financial_analysis_data(study_case_id):
    """Obtiene datos de análisis financiero directamente de la base de datos"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_financial_analysis_fastflood_pdf(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "platformCost": str(row[0]),
                    "discountRate": str(row[1]),
                    "discountRateMinimum": str(row[2]),
                    "discountRateMaximum": str(row[3]),
                    "fullPorfolio": str(row[4]),
                    "fullRoi": str(row[5]),
                    "fullScenario": str(row[6])
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching financial analysis: {e}")
        return []


def get_portfolio_objectives_data(study_case_id):
    """Obtiene datos de objetivos de portafolio directamente de la base de datos"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_objetives_for_porfolios_fastflood_pdf(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "name": str(row[0])
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching portfolio objectives: {e}")
        return []


def process_map_image(map_send_image_data):
    """Procesa y guarda la imagen del mapa desde base64"""
    try:
        base64_data = re.sub('^data:image/.+;base64,', '', map_send_image_data)
        if base64_data != "data:,":
            byte_data = base64.b64decode(base64_data)
            image_data = BytesIO(byte_data)
            img = Image.open(image_data)
            img.save(map_send_image, "png")
            return True
        return False
    except Exception as e:
        logger.error(f"Error processing map image: {e}")
        return False


def extract_financial_data(data):
    """Extrae datos financieros de la lista de datos"""
    platform_cost = 0
    discount_rate = 0
    discount_rate_minimum = 0
    discount_rate_maximum = 0
    full_portfolio = ""
    full_roi = ""
    full_scenario = ""

    for item in data:
        platform_cost = item.get('platformCost', 0)
        discount_rate = item.get('discountRate', 0)
        discount_rate_minimum = item.get('discountRateMinimum', 0)
        discount_rate_maximum = item.get('discountRateMaximum', 0)
        full_portfolio = item.get('fullPorfolio', '')
        full_roi = item.get('fullRoi', '')
        full_scenario = item.get('fullScenario', '')

    return {
        'platformCost': platform_cost,
        'discountRate': discount_rate,
        'discountRateMinimum': discount_rate_minimum,
        'discountRateMaximum': discount_rate_maximum,
        'fullPorfolio': full_portfolio,
        'fullRoi': full_roi,
        'fullScenario': full_scenario
    }


def add_text_line(text, x, y, align, font, size, pdf):
    """Agrega una línea de texto al PDF"""
    pdf.set_font(font, '', size)
    pdf.set_text_color(57, 137, 169)
    pdf.ln(y)
    pdf.cell(0, 10, text, align=align)


def render_conservation_activities_table(pdf, epw, conservation_data):
    """Renderiza la tabla de actividades de conservación"""
    import math

    # Encabezado de la tabla
    pdf.set_font('Arial', '', 7)
    pdf.set_text_color(255, 255, 255)
    pdf.set_fill_color(0, 138, 173)
    pdf.set_draw_color(0, 138, 173)

    # Primera fila de encabezados
    pdf.cell(epw/6, 10, "Name", border=1, align='C', fill=1)
    pdf.cell(epw/12, 5, "Benefit %", border=1, align='C', fill=1)
    pdf.cell(epw/13, 10, "Benefit*", border=1, align='C', fill=1)
    pdf.cell(epw/12, 5, "Implementa-", border=1, align='C', fill=1)
    pdf.cell(epw/12, 5, "Maintenance", border=1, align='C', fill=1)
    pdf.cell(epw/12, 5, "Periodicity", border=1, align='C', fill=1)
    pdf.cell(epw/12, 5, "Opportunity", border=1, align='C', fill=1)
    pdf.cell(epw/5, 5, "Transition (land use/", border=1, align='C', fill=1)
    pdf.cell(epw/12, 10, "N Manning", border=1, align='C', fill=1)
    pdf.cell(epw/12, 10, "Infiltration", border=1, align='C', fill=1)
    pdf.ln(4)

    # Segunda fila de encabezados (para las columnas que requieren dos líneas)
    pdf.cell(epw/6, 5, "")
    pdf.cell(epw/12, 5, "at time t=0", border=1, align='C', fill=1)
    pdf.cell(epw/13, 5, "")
    pdf.cell(epw/12, 5, "tion cost", border=1, align='C', fill=1)
    pdf.cell(epw/12, 5, "cost", border=1, align='C', fill=1)
    pdf.cell(epw/12, 5, "maintenance", border=1, align='C', fill=1)
    pdf.cell(epw/12, 5, "cost", border=1, align='C', fill=1)
    pdf.cell(epw/5, 5, "land cover)", border=1, align='C', fill=1)
    pdf.cell(epw/12, 5, "")
    pdf.cell(epw/12, 5, "")
    pdf.ln(4)

    # Contenido de la tabla
    pdf.set_text_color(100, 100, 100)
    pdf.set_fill_color(255, 255, 255)
    pdf.set_font('Arial', '', 9)

    for item in conservation_data:
        title = item['name']
        activities = item.get('activities', [])

        # Calcular el número de líneas necesarias para el título
        max_chars_per_line = 22  # Reducido porque la columna es más angosta
        words = title.split()
        current_line = ""
        title_lines = 0

        for word in words:
            test_line = current_line + " " + word if current_line else word
            if len(test_line) <= max_chars_per_line:
                current_line = test_line
            else:
                if current_line:
                    title_lines += 1
                current_line = word

        if current_line:
            title_lines += 1

        # Calcular la altura necesaria basada en el número de actividades y líneas del título
        # Calcular líneas totales de actividades
        total_activity_lines = 0
        if activities:
            for activity in activities:
                activity_name_temp = activity.get('name', '')
                activity_words_temp = activity_name_temp.split()
                activity_line_temp = ""
                activity_line_count = 0

                for word in activity_words_temp:
                    test_line_temp = activity_line_temp + " " + word if activity_line_temp else word
                    if len(test_line_temp) <= 30:
                        activity_line_temp = test_line_temp
                    else:
                        if activity_line_temp:
                            activity_line_count += 1
                        activity_line_temp = word

                if activity_line_temp:
                    activity_line_count += 1

                total_activity_lines += activity_line_count

        # Altura basada solo en las líneas de título más las líneas de actividades reales
        # Si no hay actividades, la altura es solo para las líneas del título
        if activities and total_activity_lines > 0:
            row_height = (total_activity_lines + title_lines) * 5
        else:
            row_height = title_lines * 5

        # Crear celdas vacías para el contenido con la nueva estructura
        pdf.cell(epw/6, row_height, "", border=1, fill=1)
        pdf.cell(epw/12, row_height, "", border=1, fill=1)
        pdf.cell(epw/13, row_height, "", border=1, fill=1)
        pdf.cell(epw/12, row_height, "", border=1, fill=1)
        pdf.cell(epw/12, row_height, "", border=1, fill=1)
        pdf.cell(epw/12, row_height, "", border=1, fill=1)
        pdf.cell(epw/12, row_height, "", border=1, fill=1)
        pdf.cell(epw/5, row_height, "", border=1, fill=1)
        pdf.cell(epw/12, row_height, "", border=1, fill=1)
        pdf.cell(epw/12, row_height, "", border=1, fill=1)
        pdf.ln(0)

        # Agregar nombre en negrita con ajuste de texto
        pdf.set_font('Arial', '', 9)

        # Calcular el ancho máximo de caracteres por línea para la columna Name
        # Aproximadamente 22 caracteres caben en epw/6
        max_chars_per_line = 22
        name_lines = []
        words = title.split()
        current_line = ""

        for word in words:
            test_line = current_line + " " + word if current_line else word
            if len(test_line) <= max_chars_per_line:
                current_line = test_line
            else:
                if current_line:
                    name_lines.append(current_line)
                current_line = word

        if current_line:
            name_lines.append(current_line)

        # Preparar valores numéricos antes de renderizar
        pdf.set_font('Arial', '', 8)

        benefit_percentaje = item.get('benefit_percentaje', '')
        benefit_percentaje_str = str(float(benefit_percentaje)) if benefit_percentaje != '' else ''

        benefit = item.get('benefit', '')
        benefit_str = str(float(benefit)).replace(".000", "") if benefit != '' else ''

        implementation_cost = item.get('implementation_cost', 0)
        implementation_str = format(float(implementation_cost), '0,.2f') if implementation_cost else '0.00'

        maintenance_cost = item.get('maintenance_cost', 0)
        maintenance_str = format(float(maintenance_cost), '0,.2f') if maintenance_cost else '0.00'

        periodicity = item.get('periodicity', 0)
        periodicity_str = format(float(periodicity), '0,.2f') if periodicity else '0.00'

        opportunity_cost = item.get('opportunity_cost', 0)
        opportunity_str = format(float(opportunity_cost), '0,.2f') if opportunity_cost else '0.00'

        
        # Agregar actividades (transiciones, n_manning, infiltration)
        if activities:
            # Primera actividad - dividir el nombre en líneas si es muy largo
            activity_name = activities[0].get('name', '')
            max_chars_activity = 30
            activity_words = activity_name.split()
            activity_line = ""
            activity_lines = []

            for word in activity_words:
                test_line = activity_line + " " + word if activity_line else word
                if len(test_line) <= max_chars_activity:
                    activity_line = test_line
                else:
                    if activity_line:
                        activity_lines.append(activity_line)
                    activity_line = word

            if activity_line:
                activity_lines.append(activity_line)

            n_manning = activities[0].get('n_manning', '')
            n_manning_str = str(float(n_manning)) if n_manning != '' else ''

            infiltration = activities[0].get('infiltration', '')
            infiltration_str = str(float(infiltration)) if infiltration != '' else ''

            # Renderizar primera línea de la actividad con borders y tamaño de fuente reducido
            print("activity_lines:", activity_lines)
            continue_from_last_line = False
            if activity_lines:
                pdf.set_font('Arial', '', 7)  # Reducir tamaño de fuente para columna Transition

                # Si hay múltiples líneas, renderizar de forma especial
                print("Si hay múltiples líneas, renderizar de forma especial, len(activity_lines):", len(activity_lines))
                if len(activity_lines) > 1:
                    # Renderizar las líneas del nombre junto con los valores numéricos
                    for i, line in enumerate(name_lines):
                        print("i, line", i, line)
                        if i == 0:
                            print("Primera línea: nombre + valores numéricos")
                            # Primera línea: nombre + valores numéricos
                            pdf.set_font('Arial', '', 9)
                            pdf.cell((epw/6)-5, 5, line, align='L')
                            pdf.set_font('Arial', '', 8)
                            pdf.cell((epw/12)+5, 5, benefit_percentaje_str, align='R')
                            pdf.cell(epw/13, 5, benefit_str, align='R')
                            pdf.cell(epw/12, 5, implementation_str, align='R')
                            pdf.cell(epw/12, 5, maintenance_str, align='R')
                            pdf.cell(epw/12, 5, periodicity_str, align='R')
                            pdf.cell(epw/12, 5, opportunity_str, align='R')
                            # Primera línea con bordes lateral y superior, con valores
                            pdf.set_font('Arial', '', 7)
                            pdf.cell(epw/5, 5, activity_lines[0], border='', align='L')                            
                            pdf.cell(epw/12, 5, n_manning_str, border='', align='R')
                            pdf.cell(epw/12, 5, infiltration_str, border='', align='R')
                            pdf.ln(5)
                            for j, act_line in enumerate(activity_lines[1:]):  
                                print(" *** act_line: ", act_line)                              
                                pdf.set_font('Arial', '', 9)
                                pdf.cell((epw/6)-5, 5, '', align='L')
                                pdf.set_font('Arial', '', 8)
                                pdf.cell((epw/12)+5, 5, "", align='R')
                                pdf.cell(epw/13, 5, "", align='R')
                                pdf.cell(epw/12, 5, "", align='R')
                                pdf.cell(epw/12, 5, "", align='R')
                                pdf.cell(epw/12, 5, "", align='R')
                                pdf.cell(epw/12, 5, "", align='R')
                                pdf.set_font('Arial', '', 7)
                                pdf.cell(epw/5, 5, act_line, border='LR', align='L')
                                pdf.cell(epw/12, 5, "", border='LR', align='R')
                                pdf.cell(epw/12, 5, "", border='LR', align='R')
                                pdf.ln(5)
                        else:
                            print("Líneas adicionales del nombre (sin valores numéricos)")
                            # Líneas adicionales del nombre (sin valores numéricos)
                            pdf.ln(5)
                            pdf.set_font('Arial', '', 9)
                            pdf.cell((epw/6)-5, 5, line, align='L')
                            pdf.set_font('Arial', '', 8)
                            pdf.cell((epw/12)+5, 5, "", align='R')
                            pdf.cell(epw/13, 5, "", align='R')
                            pdf.cell(epw/12, 5, "", align='R')
                            pdf.cell(epw/12, 5, "", align='R')
                            pdf.cell(epw/12, 5, "", align='R')
                            pdf.cell(epw/12, 5, "", align='R')
                            continue_from_last_line = True
                            
                            # Líneas intermedias (sin borde superior ni inferior)
                            for j, act_line in enumerate(activity_lines[1:-1]):
                                if i <= j:
                                    pdf.cell(epw/5, 5, act_line, border='LR', align='L')
                                    pdf.cell(epw/12, 5, "", border='LR', align='R')
                                    pdf.cell(epw/12, 5, "", border='LR', align='R')
                                    pdf.ln(5)                                
                else:
                    # Una sola línea, bordes normales
                    for i, line in enumerate(name_lines):
                        if i == 0:
                            print("*" * 40)
                            print("Primera línea: nombre + valores numéricos, i, line:", i, line)
                            # Primera línea: nombre + valores numéricos
                            pdf.set_font('Arial', '', 9)
                            pdf.cell((epw/6)-5, 5, line, align='L')
                            pdf.set_font('Arial', '', 8)
                            pdf.cell((epw/12)+5, 5, benefit_percentaje_str, align='R')
                            pdf.cell(epw/13, 5, benefit_str, align='R')
                            pdf.cell(epw/12, 5, implementation_str, align='R')
                            pdf.cell(epw/12, 5, maintenance_str, align='R')
                            pdf.cell(epw/12, 5, periodicity_str, align='R')
                            pdf.cell(epw/12, 5, opportunity_str, align='R')
                            # Primera línea con bordes lateral y superior, con valores
                            pdf.set_font('Arial', '', 7)
                            pdf.cell(epw/5, 5, activity_lines[0], border='', align='L')
                            pdf.cell(epw/12, 5, n_manning_str, border='', align='R')
                            pdf.cell(epw/12, 5, infiltration_str, border='', align='R')  
                            pdf.ln(5)                          
                        else:
                            print("demás líneas: nombre + valores numéricos", i, line)
                            # Líneas adicionales del nombre (sin valores numéricos)
                            #pdf.ln(5)
                            pdf.set_font('Arial', '', 9)
                            pdf.cell((epw/6)-5, 5, line, align='L')
                            pdf.set_font('Arial', '', 8)
                            pdf.cell((epw/12)+5, 5, "", align='R')
                            pdf.cell(epw/13, 5, "", align='R')
                            pdf.cell(epw/12, 5, "", align='R')
                            pdf.cell(epw/12, 5, "", align='R')
                            pdf.cell(epw/12, 5, "", align='R')
                            pdf.cell(epw/12, 5, "", align='R')
                            continue_from_last_line = True
                            
                            # Líneas intermedias (sin borde superior ni inferior)
                            for j, act_line in enumerate(activity_lines[1:-1]):
                                print ("Lineas intermedias: j, act_line", j, act_line)
                                if i <= j:
                                    pdf.cell(epw/5, 5, act_line, border='LR', align='L')
                                    pdf.cell(epw/12, 5, "", border='LR', align='R')
                                    pdf.cell(epw/12, 5, "", border='LR', align='R')
                                    pdf.ln(5)

                pdf.set_font('Arial', '', 8)  # Restaurar tamaño de fuente

            # Actividades adicionales (si hay más de una)
            for activity in activities[1:]:
                # Dividir el nombre de la actividad en líneas
                
                activity_name_add = activity.get('name', '')
                activity_words_add = activity_name_add.split()
                activity_line_add = ""
                activity_lines_add = []

                for word in activity_words_add:
                    test_line = activity_line_add + " " + word if activity_line_add else word
                    if len(test_line) <= max_chars_activity:
                        activity_line_add = test_line
                    else:
                        if activity_line_add:
                            activity_lines_add.append(activity_line_add)
                        activity_line_add = word

                if activity_line_add:
                    activity_lines_add.append(activity_line_add)

                # Convertir Decimal a float para n_manning e infiltration
                n_manning_add = activity.get('n_manning', '')
                n_manning_add_str = str(float(n_manning_add)) if n_manning_add != '' else ''

                infiltration_add = activity.get('infiltration', '')
                infiltration_add_str = str(float(infiltration_add)) if infiltration_add != '' else ''

                # Renderizar primera línea de la actividad adicional
                print ("Renderizar primera línea de la actividad adicional", activity_lines_add)
                if activity_lines_add:                    
                    pdf.set_font('Arial', '', 7)  # Reducir tamaño de fuente para columna Transition

                    # Si hay múltiples líneas, renderizar de forma especial
                    if len(activity_lines_add) > 1:
                        if continue_from_last_line:
                            print("continue_from_last_line: ", continue_from_last_line)
                            pdf.cell(epw/5, 5, activity_lines_add[0], border='', align='L')
                            pdf.cell(epw/12, 5, n_manning_add_str, border='', align='R')
                            pdf.cell(epw/12, 5, infiltration_add_str, border='', align='R')
                            pdf.ln(5)
                            continue_from_last_line = False
                        else:
                            # Primera línea con bordes lateral y superior, con valores
                            print("continue_from_last_line**: ", continue_from_last_line)
                            pdf.cell(epw/6, 5, "", align='L')  # Espacio de nombre
                            pdf.cell(epw/12, 5, "", align='R')   # benefit %
                            pdf.cell(epw/13, 5, "", align='R')   # benefit
                            pdf.cell(epw/12, 5, "", align='R')   # implementation
                            pdf.cell(epw/12, 5, "", align='R')   # maintenance
                            pdf.cell(epw/12, 5, "", align='R')   # periodicity
                            pdf.cell(epw/12, 5, "", align='R')   # opportunity
                            pdf.cell(epw/5, 5, activity_lines_add[0], border='', align='L')
                            pdf.cell(epw/12, 5, n_manning_add_str, border='', align='R')
                            pdf.cell(epw/12, 5, infiltration_add_str, border='', align='R')
                            pdf.ln(5)

                        # Líneas intermedias (sin borde superior ni inferior)
                        for i, act_line_add in enumerate(activity_lines_add[1:-1]):
                            print("intermedias (sin borde superior ni inferior)")
                            pdf.cell(epw/6, 5, "", align='L')
                            pdf.cell(epw/12, 5, "", align='R')
                            pdf.cell(epw/13, 5, "", align='R')
                            pdf.cell(epw/12, 5, "", align='R')
                            pdf.cell(epw/12, 5, "", align='R')
                            pdf.cell(epw/12, 5, "", align='R')
                            pdf.cell(epw/12, 5, "", align='R')
                            pdf.cell(epw/5, 5, act_line_add, border='LR', align='L')
                            pdf.cell(epw/12, 5, "", border='LR', align='R')
                            pdf.cell(epw/12, 5, "", border='LR', align='R')
                            pdf.ln(5)

                        # Última línea con bordes lateral e inferior
                        pdf.cell(epw/6, 5, "", align='L')
                        pdf.cell(epw/12, 5, "", align='R')
                        pdf.cell(epw/13, 5, "", align='R')
                        pdf.cell(epw/12, 5, "", align='R')
                        pdf.cell(epw/12, 5, "", align='R')
                        pdf.cell(epw/12, 5, "", align='R')
                        pdf.cell(epw/12, 5, "", align='R')
                        pdf.cell(epw/5, 5, activity_lines_add[-1], border='LRB', align='L')
                        pdf.cell(epw/12, 5, "", border='LRB', align='R')
                        pdf.cell(epw/12, 5, "", border='LRB', align='R')
                        pdf.ln(5)
                    else:
                        # Una sola línea, bordes normales
                        
                        if continue_from_last_line:
                            pdf.cell(epw/5, 5, activity_lines_add[0], border=1, align='L')
                            pdf.cell(epw/12, 5, n_manning_add_str, border=1, align='R')
                            pdf.cell(epw/12, 5, infiltration_add_str, border=1, align='R')
                            pdf.ln(5)
                            continue_from_last_line = False
                        else:
                            pdf.cell(epw/6, 5, "", align='L')  # Espacio de nombre
                            pdf.cell(epw/12, 5, "", align='R')   # benefit %
                            pdf.cell(epw/13, 5, "", align='R')   # benefit
                            pdf.cell(epw/12, 5, "", align='R')   # implementation
                            pdf.cell(epw/12, 5, "", align='R')   # maintenance
                            pdf.cell(epw/12, 5, "", align='R')   # periodicity
                            pdf.cell(epw/12, 5, "", align='R')   # opportunity
                            pdf.cell(epw/5, 5, activity_lines_add[0], border='LRT', align='L')
                            pdf.cell(epw/12, 5, n_manning_add_str, border='LRT', align='R')
                            pdf.cell(epw/12, 5, infiltration_add_str, border='LRT', align='R')
                            pdf.ln(5)

                    pdf.set_font('Arial', '', 8)  # Restaurar tamaño de fuente
           
        else:
            # Si no hay actividades, no agregar una línea adicional
            # Esto evita el espacio sobrante en la parte inferior
            print("PASS")
            pass

        pdf.set_font('Arial', '', 9)

    pdf.ln(8)
    pdf.cell(0, 10, '* Time required to obtain maximum benefit (year).', align='L')
    pdf.ln(15)


def render_financial_parameters_page(pdf, epw, financial_data, portfolio_data):
    """Renderiza la página de parámetros financieros"""
    
    fullPorfolio = financial_data['fullPorfolio']
    fullRoi = financial_data['fullRoi']
    fullScenario = financial_data['fullScenario']   

    pdf.set_font('Arial', '', 13)
    pdf.set_text_color(57, 137, 169)
    pdf.ln(5)
    pdf.cell(0, 10, 'Financial parameters', align='L')

    # Capturar posición Y actual para posicionamiento relativo
    current_y = pdf.get_y()

    # Líneas decorativas con posicionamiento relativo
    pdf.line(10, current_y + 25, 90, current_y + 25)
    pdf.line(100, current_y + 25, 180, current_y + 25)

    # Imagen izquierda con posicionamiento relativo
    pdf.image('imgpdf/28.png', 18, current_y + 14, w=12)
    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(57, 137, 169)
    pdf.ln(15)
    pdf.cell((epw/9) * 4, 15, 'Financial parameters', align='C')
    pdf.cell(epw/9, 15, '', align='C')
    # Imagen derecha con posicionamiento relativo
    pdf.image('imgpdf/39.png', 125, current_y + 14, w=12)
    pdf.cell((epw/9) * 4, 15, 'Portfolio objectives', align='C')
    pdf.ln(15)

    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)

    # Parámetros financieros
    pdf.cell((epw/9) * 3, 8, "Platform cost year 1 (US$/yr)")
    pdf.cell(epw/9, 8, format(float(financial_data['platformCost']), '0,.2f'), align='R')
    pdf.cell(epw/9, 15, '          ', align='C')

    # Objetivos de portafolio
    #print("len(portfolio_data):", len(portfolio_data))
    if portfolio_data and len(portfolio_data) > 0:
        pdf.cell((epw/9) * 4, 8, portfolio_data[0]['name'])
    pdf.ln(8)

    pdf.cell((epw/9) * 3, 8, "Discount rate (%)")
    pdf.cell(epw/9, 8, format(float(financial_data['discountRate']), '0,.2f'), align='R')
    pdf.cell(epw/9, 15, '', align='C')

    if portfolio_data and len(portfolio_data) > 1:
        pdf.cell(epw/9, 8, portfolio_data[1]['name'])

    # Continuar con parámetros de sensibilidad
    pdf.ln(8)
    pdf.cell((epw/9) * 3, 8, "Sensivity analysis - Minimum discount rate (%)")
    pdf.cell(epw/9, 8, format(float(financial_data['discountRateMinimum']), '0,.2f'), align='R')
    pdf.cell(epw/9, 15, '', align='C')
    img_analysis_params_h = 72
    if portfolio_data and len(portfolio_data) > 2:
        pdf.cell(epw/9, 8, portfolio_data[2]['name'])
    pdf.ln(8)

    pdf.cell((epw/9) * 3, 8, "Sensivity analysis - Maximum discount rate (%)")
    pdf.cell(epw/9, 8, format(float(financial_data['discountRateMaximum']), '0,.2f'), align='R')
    pdf.cell(epw/9, 15, '', align='C')
    if portfolio_data and len(portfolio_data) > 3:
        pdf.cell(epw/9, 8, portfolio_data[3]['name'])
    pdf.ln(8)

    if portfolio_data and len(portfolio_data) > 4:
        pdf.cell((epw/9) * 3, 8, "")
        pdf.cell(epw/9, 8, "")
        pdf.cell(epw/9, 15, '', align='C')
        pdf.cell(epw/9, 8, portfolio_data[4]['name'])
        pdf.ln(8)
        img_analysis_params_h += 8

    if portfolio_data and len(portfolio_data) > 5:
        pdf.cell((epw/9) * 3, 8, "")
        pdf.cell(epw/9, 8, "")
        pdf.cell(epw/9, 15, '', align='C')
        pdf.cell(epw/9, 8, portfolio_data[5]['name'])
        img_analysis_params_h += 8
        pdf.ln(8)

    if portfolio_data and len(portfolio_data) > 6:
        pdf.cell((epw/9) * 3, 8, "")
        pdf.cell(epw/9, 8, "")
        pdf.cell(epw/9, 15, '', align='C')
        pdf.cell(epw/9, 8, portfolio_data[6]['name'])
        img_analysis_params_h += 8
        pdf.ln(8)

    # Capturar posición Y actual para posicionamiento relativo de la imagen de Analysis parameters
    analysis_params_y = pdf.get_y()

    pdf.image('imgpdf/40.png', 70, analysis_params_y + 5, w=12)
    pdf.set_font('Arial', '', 12)
    pdf.set_text_color(57, 137, 169)
    pdf.ln(5)
    pdf.cell(0, 15, 'Analysis parameters', align='C')
    # Línea decorativa con posicionamiento relativo
    pdf.line(65, analysis_params_y + 16, 135, analysis_params_y + 16) 
    pdf.ln(15)
    pdf.set_font('Arial', '', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(epw/5, 8, "")
    pdf.cell(epw/5, 8, "Implementation time of Nature based Solution (yr)")
    pdf.cell(epw/5, 8, "")
    pdf.cell(epw/5, 8, fullPorfolio, align='R')
    pdf.cell(epw/5, 8, "")
    pdf.ln(8)
    pdf.cell(epw/5, 8, "")
    pdf.cell(epw/5, 8, "ROI analysis time (yr)")
    pdf.cell(epw/5, 8, "")
    pdf.cell(epw/5, 8, fullRoi, align='R')
    pdf.cell(epw/5, 8, "")
    pdf.ln(8)
    pdf.cell(epw/5, 8, "")
    pdf.cell(epw/5, 8, "Climate selection for baseline and NbS scenario analysis")
    pdf.cell(epw/5, 8, "")
    pdf.cell(epw/5, 8, fullScenario, align='R')
    pdf.cell(epw/5, 8, "")
    pdf.ln(17)   
    
    

def get_selector_study_cases_id(study_case_id):
    """Returns selector study cases"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM public.__get_wp_report_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "selector": row[0],
                    "watershedId": row[1],
                    "center": row[2],
                    "studyCasesId": row[3],
                    "studyCasesName": row[4],
                    "demResolution": row[5],
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching selector study cases: {e}")
        return []


def get_report_costs_analysis_roi(study_case_id):
    """Obtiene análisis de costos ROI"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_costs_analysis_roi_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "record": row[0],
                    "money": row[1],
                    "date": row[2].strftime("%Y/%m/%d") if row[2] else "",
                    "totalBenefits": row[3],
                    "totalCost": row[4],
                    "totalDiscountedBenefits": row[5],
                    "totalDiscountedCost": row[6]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching costs analysis ROI: {e}")
        return []


def get_cost_and_benefit(study_case_id):
    """Obtiene costos y beneficios"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_graph_cost_bene_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "currencyr": row[0],
                    "costr": row[1],
                    "benefift": row[2]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching cost and benefit: {e}")
        return []


def get_net_present_value_summary(study_case_id):
    """Obtiene resumen de valor presente neto"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_graph_vpn_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "currencyr": row[0],
                    "implementationr": row[1],
                    "maintenancer": row[2],
                    "oportunityr": row[3],
                    "transactionr": row[4],
                    "platformr": row[5],
                    "benefitr": row[6],
                    "totalr": row[7]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching NPV summary: {e}")
        return []


def get_sensibility_analysis_benefits(study_case_id):
    """Obtiene análisis de sensibilidad de beneficios"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_analisys_sensitivy_benefits_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "timer": row[0],
                    "totalMinBenefitR": row[1],
                    "totalMedBenefitR": row[2],
                    "totalMaxBenefittR": row[3]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching sensibility analysis benefits: {e}")
        return []


def get_sensibility_analysis_cost(study_case_id):
    """Obtiene análisis de sensibilidad de costos"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_analisys_sensitivy_cost_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "timer": row[0],
                    "totalMinCostR": row[1],
                    "totalMedCostR": row[2],
                    "totalMaxCostR": row[3]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching sensibility analysis cost: {e}")
        return []


def get_report_analisys_benefics(study_case_id):
    """Obtiene análisis de beneficios"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_analisys_benefics_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "nameIndicator":row[0],
					"value":row[1],
					"color":row[2],
					"description":row[3],
					"watershedId":row[4]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching analisys benefics: {e}")
        return []


def get_report_oportunity_result_indicators(study_case_id):
    """Obtiene indicadores de resultados de oportunidad"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_oportunity_result_indicators_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "currency":row[0],
					"value":row[1],
					"description":row[2]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching opportunity result indicators: {e}")
        return []


def get_report_analisys_benefics_c(study_case_id):
    """Obtiene análisis de beneficios C"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_analisys_beneficsC_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "sbnf":row[0],
					"costPerHectarea":row[1],
					"recomendedIntervetion":row[2],
					"watershedId":row[3],
					"name":row[4]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching analisys benefics C: {e}")
        return []


def get_wp_aqueduct_indicator_graph(study_case_id):
    """Obtiene gráfico de indicadores de acueducto"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_wp_aqueduct_indicator_graph_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "name": row[0],
                    "category": row[1],
                    "y": row[2]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching aqueduct indicator graph: {e}")
        return []


def get_waterproof_reports_analysis_benefits(study_case_id):
    """Obtiene análisis de beneficios de Waterproof"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_waterproof_reports_analysis_benefits_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "name": row[0],
                    "y": row[1]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching waterproof reports analysis benefits: {e}")
        return []


def get_report_analysis_benefits_filter_sum(study_case_id):
    """Obtiene suma filtrada de análisis de beneficios"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_analysis_benefits_filter_sum_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "timer": row[0],
                    "totalBenefits": row[1]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching analysis benefits filter sum: {e}")
        return []


def get_report_costs_analysis_filter(study_case_id):
    """Obtiene filtro de análisis de costos"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_costs_analysis_filter_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "name": row[0],
                    "year": row[1],
                    "subName": row[2],
                    "totalCost": row[3],
                    "totalDiscountedBenefits": row[4],
                    "totalBenefits": row[5],
                    "totalDiscountedCost": row[6]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching costs analysis filter: {e}")
        return []

def get_report_costs_analysis_filter_grouped(study_case_id):
    """Obtiene filtro de análisis de costos"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT typer, round(cast(SUM(medbenefitr) as numeric),2)::double precision AS sum_filter FROM __get_report_costs_analysis_filter_fastflood(%s)  GROUP BY  typer ORDER BY typer"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "typer":row[0],
					"sumFilter":row[1]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching costs analysis filter: {e}")
        return []
    
def get_report_costs_analysis_filter_nbs(study_case_id):
    """Obtiene filtro de análisis de costos NBS"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_costs_analysis_filterBgraph_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "activity": row[0],
                    "totalCost": row[1]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching costs analysis filter NBS: {e}")
        return []


def get_wp_compare_mapas(study_case_id):
    """Obtiene rutas de mapas para comparación"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_wp_compare_mapas_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "route": row[0]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching compare mapas: {e}")
        return []


def get_study_cases_intake(study_case_id):
    """Obtiene información de intake del caso de estudio"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_study_cases_intake_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "name": row[0]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching study cases intake: {e}")
        return []


def get_report_analisys_benefics_b(study_case_id):
    """Obtiene análisis de beneficios B"""
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM __get_report_analisys_beneficsB_fastflood(%s)"
            cursor.execute(sql, [study_case_id])
            rows = cursor.fetchall()
            objects_list = []
            for row in rows:
                objects_list.append({
                    "changeInVolumeOfWater":row[0],
					"changeInBaseFlow":row[1],
					"changeIntotalSediments":row[2],
					"changeInNitrogenLoad":row[3],
					"changeInPhosphorus":row[4],
					"changeInCarbonStorage":row[5],
					"time":row[6],
					"currency":row[7],
					"roi":row[8],
					"result":row[9],
					"transactionCost":row[10]
                })
            return objects_list
    except Exception as e:
        logger.error(f"Error fetching analisys benefics B: {e}")
        return []

def get_flood_mitigation(study_case_id):
    """
    Obtiene datos de mitigación de inundaciones y retorna totales acumulados por categoría
    Equivalente al código JavaScript en decisionIndicators.html líneas 648-677
    """
    try:
        # Obtener el folder_name del estudio de caso
        with connection.cursor() as cursor:
            cursor.execute("SELECT folder_name FROM waterproof_fastflood_studycases WHERE id = %s", [study_case_id])
            row = cursor.fetchone()
            if not row:
                logger.error(f"Study case not found: {study_case_id}")
                return []
            case_folder = row[0]

        # Configurar rutas
        api_server = settings.WATERPROOF_API_SERVER
        server = api_server.replace("/proxy/?url=", "").replace("wf-models", "")
        out_damage_path = "/ROI/out/6.0_Damage_Saves.csv"
        base_path = "/app/outputs/fastflood/"
        complete_path = os.path.join(base_path, case_folder) + out_damage_path
        url_path = server + "outputs/fastflood/" + case_folder + out_damage_path

        # Leer datos del CSV
        data = []
        if os.path.exists(complete_path):
            # Leer desde archivo local
            with open(complete_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    data.append(row)
        else:
            # Leer desde URL
            logger.info(f"Local file not found: {complete_path}, trying URL: {url_path}")
            response = requests.get(url_path)
            response.raise_for_status()
            csv_content = response.text
            reader = csv.DictReader(csv_content.splitlines())
            for row in reader:
                data.append(row)

        # Categorías a procesar
        categorias = ["Residential", "Commercial", "Industrial", "InfraRoads", "Agriculture"]

        # Inicializar acumulado en 0
        acumulado = {cat: 0 for cat in categorias}

        # Sumar los valores
        for item in data:
            for cat in categorias:
                acumulado[cat] += float(item.get(cat, 0))

        # Crear la estructura final (equivalente a dataTotalBenefits en JavaScript)
        data_total_benefits = [
            {"name": cat, "y": acumulado[cat]}
            for cat in categorias
        ]

        return data_total_benefits

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching from URL {url_path}: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Error in get_floot_mitigation: {str(e)}")
        return []
