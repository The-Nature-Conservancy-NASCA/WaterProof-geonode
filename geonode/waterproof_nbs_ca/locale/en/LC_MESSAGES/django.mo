��    K      t  e   �      `  !   a     �     �     �     �  "   �     �     �      �  	   �       
              +  	   L     V     ]     i     {     �     �     �     �  �   �     U  !   r    �  !   �	  ;   �	     
     &
     ?
  $   ]
     �
  J   �
  W   �
     B     [     y  ?   �  !   �     �               %     4     F     N     _  �   d     �       .   %  	   T  
   ^  #   i      �     �     �     �     �     �               (     :     L     ^     p     �     �     �     �     �  e  �  !        4     ;     A     F     N     _     p     y  	   �     �  
   �     �  	   �  	   �     �     �     �     �  !        5     K     P  �   S     �  !       (  !   E  ;   g     �     �     �  $   �       J   ,  W   w     �     �     �        !   &  "   H     k  
   }     �     �     �     �     �  �   �     S  /   s  0   �  	   �  
   �  "   �          ,     K  
   P     [     m  t  s  x   �  t   a  g   �  �   >  �   &  �   �  �   �     [     b     g     n            >      3           =           ?                        H   +             2   "   !   %           *                          $                 7       -   9         J   '                    6      @      A         F   :   B         C   I       #   (   8          <   /       	   E   D   )              ,   1   G   
   0   4   5   &       K   ;                  .    Clone Nature based solution (NBS) Cloned Close Code Country Create Nature based solution (NBS) Create a new NBS Currency Currency for definition of costs Currency: Description Detail sbn Duplicated nbs Edit Nature based solution (NBS) Fact cost Factor Field empty Field is required General Settings Geom files help? Global USA based Help Id If there are areas with restrictions for the implementation of the NbS, attach them to the form through a geographic file by clicking on the following button. Implementation cost (US$/ha) Implementation cost (currency/ha) In this section you can consult the nature-based solutions available in the system, understood as the actions that may be part of the portfolios offered by the system when it executes its analyzes. You can also create your own nature-based solutions by clicking on 'Create new SNB'  LAND USE / LAND COVER TRANSFORMED LAND USE / LAND COVER WHERE THE ACTIVITY CAN BE IMPLEMENTED Load new restricted area Maintenace cost (US$/ha) Maintenace cost (currency/ha) Multiplying factor for overrall cost Nature based solutions (NBS) Only .zip and .geojson are admited. The .zip must be a ESRI shapefile type Only EPSG 3857 and EPSG 4326 are supported. For GeoJSON case, only EPSG 4326 is admited Oportunity cost (US$/ha) Oportunity cost (currency/ha) Options Percentage of benefit associated with interventions at time t=0 Periodicity of maintenance (year) Periodicity of maintenance (yr) Permission denied RIOS Transition Reference cost Reference country Region: Restricted areas Save Select from the drop-down list the transition according to the possibilities of the Resource Investment Optimization System (RIOS) software The maximum upload size is 10MB Time maximum benefit Time required to generate maximun benefit (yr) Unique_id Unit costs Unit implementation costs (US $/ha) Unit maintenance costs (US $/ha) Unit oportunity costs (US $/ha) User Waterproof Detail NBS CA Waterproof NBS CA clone create-nbs-help-1 create-nbs-help-2 create-nbs-help-3 create-nbs-help-4 create-nbs-help-5 create-nbs-help-6 create-nbs-help-7 create-nbs-help-8 delete edit report view Project-Id-Version: Waterproof Valpha
Report-Msgid-Bugs-To: 
PO-Revision-Date: 2021-08-02 16:33-0500
Last-Translator: Julien Collaer <julien.collaer@opengeode.be>
Language-Team: Skaphe
Language: en
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Plural-Forms: nplurals=2; plural=(n != 1);
X-Generator: Poedit 2.4.3
 Clone Nature based solution (NbS) Cloned Close Code Country Create a new NbS Create a new NbS Currency Currency for cost definition Currency: Description NbS Detail Duplicated NbS Edite NbS Base cost Factor Field empty Field is required General information What geographic files can upload? NbS Global, USA based Help Id If there are areas with restrictions for the implementation of the NbS, attach them to the form through a geographic file by clicking on the following button. Implementation cost Implementation cost (currency/ha) From this section you can consult the nature-based solutions available in the system, understood as the actions that may be part of the portfolios offered by the system when it executes its analyzes. You can also create your own nature-based solutions by clicking on 'Create new SNB'  Land use / Land cover transformed Land use / Land cover where the activity can be implemented Load new restricted area Maintenace cost Maintenace cost (currency/ha) Multiplying factor for overrall cost Nature based solutions (NbS) Only .zip and .geojson are admited. The .zip must be a ESRI shapefile type Only EPSG 3857 and EPSG 4326 are supported. For GeoJSON case, only EPSG 4326 is admited Oportunity cost Oportunity cost (currency/ha) Options Benefit percentage at time t = 0 Periodicity of maintenance (year) Periodicity of maintenance (years) Permission denied Transition Reference cost Reference country Region: Restricted areas Save Select from the drop-down list the transition according to the possibilities of the Resource Investment Optimization System (RIOS) software The maximum upload size is 10MB Time required to obtain maximum benefit (years) Time required to obtain  maximun benefit (years) Unique_id Unit costs Implementation costs (Currency/ha) Maintenance costs (Currency/ha) Oportunity costs (Currency/ha) User NbS Detail Waterproof NBS CA Clone You can create a Nature-Based Solution by entering the name, description, implementation and maintenance costs, and other information. However, you should pay special attention to the Coverage / Land Use Transitions section, as this is where you configure the coverage changes that WaterProof will take into account for NBS portfolio generation, modeling and ROI analysis. Once you select the transition of your interest, you must indicate the changes in the coverage that you hope to achieve: Finally, you can attach a shapefile where you indicate areas where the implementation of the created NBS is avoided: Note that the shapefile must have 2 attributes which are required for ROI to interpret the information: activity_n: This field must contain the exact name of the activity that has been defined in the system (this refers to the csv file of parameters that enters RIOS and that the system arms according to what is selected by the user). Action: This field is of type text and only admits two options: 1) prevent if you want to restrict an activity in that area or 2) prefer if you want to give priority to the activity in that area. The system will verify that the polygon is within the watershed area and that it meets the coordinate standard. EPSG 3857 (world standard for flat coordinates) or EPSG 4326 (world standard for geographic coordinates) Files are accepted only in compressed .zip format whose required structure must contain at least: 1 .shp file, 1 .dbf file, 1 .prj file and 1 .shx file Delete Edit Report View 