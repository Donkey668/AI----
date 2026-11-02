import { describe,it,expect,vi } from 'vitest';
import * as original from '../../.migration/baseline/lib/records/notebook';
import * as migrated from '../../packages/shared/src/records/notebook';
const valid={observationDate:'2026-11-02',observationTime:'08:30',birdPoint:' 深圳湾 ',speciesName:' 黑脸琵鹭 ',note:''};
describe('record rule differential',()=>{
 for(const [label,input] of Object.entries({valid,null:null,empty:{},format:{...valid,observationDate:'2026/11/02'},regexOnlyDate:{...valid,observationDate:'2026-99-99'},note100:{...valid,note:'鸟'.repeat(100)},note101:{...valid,note:'鸟'.repeat(101)},unicode100:{...valid,note:'🦜'.repeat(100)},manualCoordinates:{...valid,coordinates:{longitude:114,latitude:22}},deviceMissing:{...valid,locationSource:'device'},deviceValid:{...valid,locationSource:'device',coordinates:{longitude:114,latitude:22}},mapValid:{...valid,locationSource:'map',coordinates:{longitude:180,latitude:90}},infinite:{...valid,coordinates:{longitude:Infinity,latitude:22}},outside:{...valid,coordinates:{longitude:181,latitude:22}}})){
  it(label,()=>expect(migrated.validateNotebookRecordInput(input)).toEqual(original.validateNotebookRecordInput(input)));
 }
 it('Beijing time and ISO',()=>{
  const now=new Date('2026-11-01T18:35:00Z');
  expect(migrated.getCurrentBeijingDateTime(now)).toEqual(original.getCurrentBeijingDateTime(now));
  expect(migrated.toObservationDateTimeIso('2026-11-02','02:35')).toEqual(original.toObservationDateTimeIso('2026-11-02','02:35'));
 });
 it('create update sorting summary',()=>{
  vi.spyOn(crypto,'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000001');
  const input=original.validateNotebookRecordInput(valid);if(!input.ok) throw new Error('fixture');
  const now=new Date('2026-11-02T00:00:00Z');
  const a=original.createStoredObservationRecord('MIGRATION_A',input.value,now);
  const b=migrated.createStoredObservationRecord('MIGRATION_A',input.value,now);
  expect(b).toEqual(a);
  expect(migrated.updateStoredObservationRecord(b,{...input.value,note:'updated'},now)).toEqual(original.updateStoredObservationRecord(a,{...input.value,note:'updated'},now));
  const records=[a,{...a,recordId:'second',speciesName:'other',updatedAt:'2026-11-03T00:00:00Z'}];
  expect(migrated.createNotebookSnapshot(records)).toEqual(original.createNotebookSnapshot(records));
 });
});
