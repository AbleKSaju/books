import test from 'tape';
import { closeTestFyo, getTestFyo, setupTestFyo } from 'tests/helpers';
import { ModelNameEnum } from 'models/types';
import { Lead } from '../Lead/Lead';
import { Party } from '../Party/Party';

const fyo = getTestFyo();
setupTestFyo(fyo, __filename);

const leadData = {
  name: 'name2',
  status: 'Open',
  email: 'sample@gmail.com',
  mobile: '1231233545',
};

const itemData: { name: string; rate: number } = {
  name: 'Pen',
  rate: 100,
};

test('create test docs for Lead', async (t) => {
  await fyo.doc.getNewDoc(ModelNameEnum.Lead, leadData).sync();

  t.ok(
    fyo.db.exists(ModelNameEnum.Lead, leadData.name),
    `dummy item ${leadData.name} exists`
  );
});

test('create Customer', async (t) => {
  const leadDoc = (await fyo.doc.getDoc(ModelNameEnum.Lead, 'name2')) as Lead;

  const newPartyDoc = fyo.doc.getNewDoc(ModelNameEnum.Party, {
    ...leadDoc.getValidDict(),
    fromLead: leadData.name,
    role: 'Customer',
    phone: leadData.mobile as string,
  });

  t.equals(
    leadDoc.status,
    'Open',
    'Before Customer created the status must be Open'
  );
  let x = await newPartyDoc.sync()


  t.equals(
    leadDoc.status,
    'Converted',
    'After Customer created the status change to Converted'
  );

  t.ok(
    await fyo.db.exists(ModelNameEnum.Party, newPartyDoc.name),
    'Customer created from Lead'
  );
});

test('create test docs for Item', async (t) => {
  await fyo.doc.getNewDoc(ModelNameEnum.Item, itemData).sync();

  t.ok(
    fyo.db.exists(ModelNameEnum.Item, itemData.name),
    `dummy item ${itemData.name}  exists`
  );
});

test('create SalesQuote', async (t) => {
  const leadDoc = (await fyo.doc.getDoc(ModelNameEnum.Lead, 'name2')) as Lead;
  const docData = leadDoc.getValidDict(true, true);

  const newSalesQuoteDoc = fyo.doc.getNewDoc(ModelNameEnum.SalesQuote, {
    ...docData,
    party: docData.name,
    referenceType: ModelNameEnum.Lead,
    items: [
      {
        item: itemData.name,
        rate: itemData.rate,
      },
    ],
  }) as Lead;

  t.equals(
    leadDoc.status,
    'Converted',
    'Before SalesQuote created the status must be Open'
  );
  await newSalesQuoteDoc.sync();
  await newSalesQuoteDoc.submit();

  t.equals(
    leadDoc.status,
    'Quotation',
    'After SalesQuote created the status change to Quotation'
  );

  t.ok(
    await fyo.db.exists(ModelNameEnum.SalesQuote, newSalesQuoteDoc.name),
    'SalesQuote Created from Lead'
  );
});

test('remove Customer', async (t) => {
  const partyDoc = (await fyo.doc.getDoc(
    ModelNameEnum.Party,
    'name2'
  )) as Party;
  await partyDoc.delete();

  t.equals(
    await fyo.db.exists(ModelNameEnum.Party, 'name2'),
    false,
    'Customer deleted'
  );
  const leadDoc = (await fyo.doc.getDoc(ModelNameEnum.Lead, 'name2')) as Lead;

  t.equals(
    leadDoc.status,
    'Interested',
    'After Customer deleted the status changed to Interested'
  );
});

closeTestFyo(fyo, __filename);
