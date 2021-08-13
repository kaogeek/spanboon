import { ProcessorUtil } from '../../../src/utils/ProcessorUtil';
import { SectionModel } from '../../../src/api/models/SectionModel';
import { LastestLookingSectionProcessor } from '../../../src/api/processors/LastestLookingSectionProcessor';
import { StillLookingSectionProcessor } from '../../../src/api/processors/StillLookingSectionProcessor';
import { EmergencyEventSectionProcessor } from '../../../src/api/processors/EmergencyEventSectionProcessor';

function generateMockProcessor(): any[] {
    const result = [];

    const processor1 = new LastestLookingSectionProcessor(undefined, undefined, undefined);
    processor1.process = function () {
        const sectionModel = new SectionModel();
        sectionModel.title = '1';
        return Promise.resolve(sectionModel);
    };
    result.push(processor1);

    const processor2 = new StillLookingSectionProcessor(undefined, undefined, undefined);
    processor2.process = function () {
        const sectionModel = new SectionModel();
        sectionModel.title = '2';
        return Promise.resolve(sectionModel);
    };
    result.push(processor2);

    const processor3 = new EmergencyEventSectionProcessor(undefined, undefined);
    processor3.process = function () {
        const sectionModel = new SectionModel();
        sectionModel.title = '3';
        return Promise.resolve(sectionModel);
    };
    result.push(processor3);

    const processor4 = new LastestLookingSectionProcessor(undefined, undefined, undefined);
    processor4.process = function () {
        const sectionModel = new SectionModel();
        sectionModel.title = '4';
        return Promise.resolve(sectionModel);
    };
    result.push(processor4);

    return result;
}

describe('to test randomProcessorOrdering.', () => {
    test('Processor Undefine/Null/length 0 run return result array 0.', async () => {
        let result = ProcessorUtil.randomProcessorOrdering(undefined);
        expect(result.length).toBe(0);

        result = ProcessorUtil.randomProcessorOrdering(null);
        expect(result.length).toBe(0);

        result = ProcessorUtil.randomProcessorOrdering([]);
        expect(result.length).toBe(0);
    });

    test('To test Random data array.', async () => {
        const processor = generateMockProcessor();
        const result = ProcessorUtil.randomProcessorOrdering(processor);
        expect(result.length).toBe(4);

        const processorName = ['1', '2', '3', '4'];
        for (const p of result) {
            p.process().then((obj: any) => {
                const title = obj.title;
                expect(processorName.indexOf(title)).toBeGreaterThanOrEqual(0);
            });
        }

    });
});