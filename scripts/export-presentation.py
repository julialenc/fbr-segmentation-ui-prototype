"""Export selected accepted aggregates. Reads research; writes only the UI fixture.
Run: python -B scripts/export-presentation.py --analytical-root ../food-beverage-positioning-radar
Use --check to verify the existing export without writing.
"""
import argparse, csv, hashlib, json, re
from pathlib import Path
p=argparse.ArgumentParser(); p.add_argument('--analytical-root',type=Path,required=True); p.add_argument('--check',action='store_true'); args=p.parse_args()
base=args.analytical_root.resolve(); package=base/'presentations/segmentation/first_run/04_analytical_package'; out=package/'output'
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
freeze=json.loads((package/'RELEASE_FREEZE_v1.json').read_text())
for name,digest in freeze['files'].items():
    if sha(package/name)!=digest: raise ValueError('Frozen file mismatch: '+name)
f=json.loads((out/'approved_findings_v1.json').read_text())
def rows(name):
    with (out/name).open(encoding='utf-8-sig',newline='') as h: return list(csv.DictReader(h))
def n(value): return int(float(value))
summary=rows('population_summary_v1.csv'); coverage=rows('communication_coverage_v1.csv')
source_paths=['presentations/segmentation/first_run/04_analytical_package/output/'+s for s in ['population_summary_v1.csv','communication_coverage_v1.csv','approved_findings_v1.json']]
biscuit='presentations/segmentation/first_run/03_lenses/01_nutritional_composition/biscuits_and_wafers_CHECK_v1.md'
pudding='presentations/segmentation/first_run/03_lenses/02_nutrient_density/dairy_dessert_formulations_v1.md'
source_paths += ['presentations/segmentation/first_run/03_lenses/AUDIT_v1.md',biscuit,pudding,'presentations/segmentation/first_run/03_lenses/FORMULATION_DECISIONS_v1.csv']
def table(path,heading):
    text=(base/path).read_text(encoding='utf-8'); part=text.split(heading,1)[1].split('\n## ',1)[0]
    return [[c.strip() for c in line.strip().strip('|').split('|')] for line in part.splitlines() if line.startswith('|')][2:]
def claim(branch,region,prop,slice_name):
    found=[r for r in coverage if r['cohort_family']=='accepted' and r['branch']==branch and r['region']==region and r['proposition']==prop and r['slice']==slice_name]
    if len(found)!=1: raise ValueError('Coverage selection not unique: '+str((branch,region,prop,slice_name,len(found))))
    r=found[0]
    return {k:n(r[v]) for k,v in {'population':'population_n','matched':'matched_eligible_n','usable':'usable_market_n','positive':'positive_n','nonDetection':'documented_non_detection_n','humanNegative':'human_negative_n','uncertain':'uncertain_n','otherUnknown':'other_unknown_assessed_n','unassessed':'unassessed_n','marketLimited':'market_limited_n','known':'known_primary_n'}.items()}
families=[]
for id,branch,title,category,prop,conclusion,rule in [
 ('soda','soda','Soda','Beverages','sugar_free_claim','A very-low-sugars profile is retained within comparable liquid sodas. Selected UK/Irish assessments support a difference in sugar-related communication.','Sugars ≤0.5 g/100 ml, within the accepted comparable-liquid population.'),
 ('pudding','dessert cream/pudding','Dessert creams & puddings','Dairy','protein_claim','A recurring higher-protein, lower-energy profile is retained. Assessed protein communication is too sparse to characterize that profile.','Protein ≥8 g/100 g and energy 10–110 kcal/100 g, within the accepted comparable format.')]:
    regions=[]
    for region in ['FR','UK-IE','US-CA']:
        r=next(r for r in summary if r['record_kind']=='approved profile' and r['profile_family']==branch and r['region']==region)
        regions.append({'region':region,'otherCommunication':claim(branch,region,prop,'other measurable'),'population':n(r['population_n']),'measurable':n(r['eligible_n']),'profile':n(r['retained_n']),'other':n(r['other_measurable_n']),'unknown':n(r['unknown_required_n']),'communication':claim(branch,region,prop,'retained profile')})
    families.append({'id':id,'title':title,'category':category,'outcome':'Descriptive profile retained','conclusion':conclusion,'basis':'per 100 ml' if id=='soda' else 'per 100 g','rule':rule,'proposition':'Sugar-related communication' if id=='soda' else 'Protein communication','regions':regions})
# Existing report tables, never rerun matching or classification.
counts=table(biscuit,'## Format and nutrient coverage')
pairs=table(biscuit,'## Similar-sugar pair differences')
regions=[]
for region in ['FR','UK-IE','US-CA']:
    c=next(r for r in counts if r[0]=='biscuit' and r[1]==region)
    pair=next(r for r in pairs if r[0]=='biscuit' and r[1]==region and r[2]=='all, matched within wording')
    regions.append({'region':region,'population':n(c[2]),'measurable':n(c[3]),'unknown':n(c[2])-n(c[3]),'pairs':n(pair[4]),'gaps':[float(v.strip()) for v in pair[5].split('/')]})
families.insert(1,{'id':'biscuit','title':'Biscuits','category':'Snacks','outcome':'Variation without an additional profile','conclusion':'Biscuits differ in fat, salt and protein even at similar sugars. The investigated differences did not justify an additional named nutritional profile.','basis':'per 100 g','rule':'Within-format matched comparisons; no retained nutritional threshold.','proposition':None,'regions':regions})
# The accepted first summary table supplies profile medians; no product examples exported.
pudding_text=(base/pudding).read_text(encoding='utf-8')
medians={}
for line in pudding_text.splitlines():
    if line.startswith('| France |') or line.startswith('| UK/Ireland |'):
        cells=[c.strip() for c in line.strip('|').split('|')]
        if len(cells)==5 and 'g,' in cells[4]: medians['FR' if cells[0]=='France' else 'UK-IE']=[float(x) for x in re.findall(r'\d+(?:\.\d+)?',cells[4])]
for r in families[2]['regions']:
    if r['region'] in medians: r['medians']=medians[r['region']]
for family in families:
    for region in family['regions']:
        if 'gaps' in region:
            region['metrics']=[{'label':label,'unit':'g/100 g','statistic':'Median absolute paired difference','value':value,'decimals':2} for label,value in zip(['Fat','Salt','Protein'],region.pop('gaps'))]
        if 'medians' in region:
            region['metrics']=[{'label':label,'unit':unit,'statistic':'Retained-profile median','value':value,'decimals':1} for label,unit,value in zip(['Protein','Energy','Fat','Sugars'],['g/100 g','kcal/100 g','g/100 g','g/100 g'],region.pop('medians'))]
comparators=re.search(r'median protein was ([0-9.]+) g in France and ([0-9.]+) g in UK/Ireland, and median sugars were ([0-9.]+) and ([0-9.]+) g',pudding_text)
if not comparators: raise ValueError('Accepted pudding comparator summary missing')
values=[float(v) for v in comparators.groups()]
for region in families[2]['regions']:
    if region['region'] in ['FR','UK-IE']:
        index=0 if region['region']=='FR' else 1
        for m in region['metrics']:
            if m['label']=='Protein': m['other']=values[index]
            if m['label']=='Sugars': m['other']=values[index+2]
result=f['communication']['supported_uk_soda']['result']
contrast={k:result[v] for k,v in {'positiveProfile':'profile_positive_n','knownProfile':'profile_known_n','populationProfile':'profile_population_n','positiveOther':'other_positive_n','knownOther':'other_known_n','populationOther':'other_population_n','effect':'effect','lo':'lo','hi':'hi'}.items()}
catalogue=[]
for d in f['formulation']['decisions']:
    if not any(x['branch']==d['branch'] for x in catalogue): catalogue.append({k:d[k] for k in ['branch','decision','scope_note']})
data={'schema_version':'1.0-presentation','synthetic_demo':False,'model':{'status':'ACCEPTED_FROZEN','algorithm':None,'feature_set':None,'approval_version':f['version']},'views':[], 'research':{'release':{'version':f['version'],'status':f['status'],'cutoff':'29 September 2026','retrieved':'17 October 2026','unit':'barcode–region–category assignments','digest':freeze['release_digest']},'families':families,'sodaContrast':contrast,'catalogue':catalogue,'sources':[{'path':s,'sha256':sha(base/s)} for s in source_paths]}}
text=json.dumps(data,ensure_ascii=False,indent=2,allow_nan=False)+'\n'
target=Path(__file__).resolve().parents[1]/'src/data/accepted-presentation.json'
if args.check:
    if target.read_text(encoding='utf-8')!=text: raise ValueError('Presentation export differs from accepted evidence')
    print('PASS: selected presentation values and source hashes match accepted evidence')
else:
    target.write_text(text,encoding='utf-8'); print('Exported selected aggregate presentation:',target)
