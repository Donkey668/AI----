import { it,expect } from 'vitest';
import * as original from '../../.migration/baseline/lib/records/notebook-export';
import * as migrated from '../../packages/shared/src/records/notebook-export';
import type { NotebookRecordSnapshot } from '../../packages/shared/src/records/notebook';
const row:NotebookRecordSnapshot={recordId:'b',observationDate:'2026-11-02',observationTime:'08:00',observationDateTimeIso:'2026-11-02T00:00:00Z',birdPoint:'深圳湾',speciesName:'白鹭',note:'不导出备注',locationSource:'manual',coordinates:null,createdAt:'2026-11-02T00:00:00Z',updatedAt:'2026-11-02T00:00:00Z'};
for(const account of ['MIGRATION_A',' CON ','a/b:*?',' .. ','','鸟类爱好者']) it('TXT '+account,()=>{
 const records=[row,{...row,recordId:'a'}, {...row,recordId:'c',observationDate:'2026-11-01',observationDateTimeIso:'2026-11-01T00:00:00Z'}];
 expect(migrated.buildNotebookExportDocument(account,records)).toEqual(original.buildNotebookExportDocument(account,records));
 expect(migrated.buildNotebookExportDocument(account,[])).toEqual(original.buildNotebookExportDocument(account,[]));
});
