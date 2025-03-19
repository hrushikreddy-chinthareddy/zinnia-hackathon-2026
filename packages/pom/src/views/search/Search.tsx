import clsx from 'clsx';
import { default as styles } from './Search.module.css';
import {
  FieldDataActive,
  Icon,
  IconType,
  Select,
  Button,
  FieldStatus,
} from '@zinnia/bloom/components';
import { SearchResult } from '../../types/search.types';
import { ProducerType } from '../../types';
import { Controller, useForm } from 'react-hook-form';
import PomTable from '../../components/pom-table/PomTable';
import { default as PomStyles } from '../../styles/pom.module.css';
import { useNavigate } from 'react-router';
import { searchProducer } from '../../queries/producers';
import { useMutation } from '@tanstack/react-query';

interface SearchFormValues {
  npn: number;
}

export const Search = () => {
  const { handleSubmit, control, formState, register } =
    useForm<SearchFormValues>();
  const navigate = useNavigate();
  const tableHeaders = {
    name: 'Name',
    npn: 'NPN',
    typeOfEntity: 'Type of Entity',
    email: 'Email',
    businessPhone: 'Business Phone',
  };

  // Create a mutation for the search operation
  const { isSuccess, isError, isPending, data, mutate, isIdle } = useMutation({
    mutationFn: (data: {
      nationalProducerNumber: number;
      limit?: number;
      offset?: number;
    }) => searchProducer(data),
    onError: error => {
      console.error('Error searching for producers:', error);
    },
  });

  const tableRows = (searchResults: SearchResult[] = []) =>
    searchResults.map(searchResult => {
      const iconType =
        searchResult.producerType === ProducerType.INDIVIDUAL
          ? IconType.USER
          : IconType.OFFICEBUILDING;

      const name =
        searchResult.producerType === ProducerType.INDIVIDUAL
          ? `${searchResult.firstName} ${searchResult.lastName}`
          : searchResult.producerName;

      const handleClick = () => {
        const path =
          searchResult.producerType === ProducerType.INDIVIDUAL
            ? `/agents/${searchResult.nationalProducerNumber}`
            : `/agencies/${searchResult.nationalProducerNumber}`;
        navigate(path);
      };

      return {
        name: (
          <div className={clsx(styles.name)}>
            <Icon type={iconType} width={16} height={16} />

            <span className={clsx(PomStyles.cta)} onClick={handleClick}>
              {name}
            </span>
          </div>
        ),
        npn: searchResult.nationalProducerNumber,
        typeOfEntity: searchResult.producerType,
        email: searchResult.email,
        businessPhone: searchResult.phone,
      };
    });

  const onSubmit = ({ npn }: SearchFormValues) => {
    // This query is supposed to only return 1 result, so we can default to limit: 10, offset:0
    // Design specifically asked not to implement pagination in the UI
    mutate({
      nationalProducerNumber: npn,
      limit: 10,
      offset: 0,
    });
  };

  return (
    <div
      className={clsx(styles.container)}
      id={PomStyles['producer-onboarding-maintenance']}
    >
      <h1 className={clsx(styles.title)}>Find a producer</h1>
      <div className={clsx(styles.cardContainer)}>
        <form className={clsx(styles.form)} onSubmit={handleSubmit(onSubmit)}>
          <div className={clsx(styles.formFields)}>
            <div className={clsx(styles.selectFieldContainer)}>
              <Select
                options={[{ textValue: 'NPN', value: 'npn' }]}
                defaultValue="npn"
                fieldSize="small"
                disabled
              />
            </div>
            <Controller
              control={control}
              name="npn"
              render={() => (
                <div className={clsx(styles.inputFieldContainer)}>
                  <div className={clsx(styles.inputWithIcon)}>
                    <Icon
                      type={IconType.SEARCH}
                      className={clsx(styles.searchIcon)}
                    />
                    <FieldDataActive
                      placeholder="National Producer Number"
                      className={clsx(styles.inputField)}
                      fieldSize="small"
                      {...register('npn', {
                        required: true,
                        maxLength: 8,
                        minLength: 8,
                      })}
                      fieldStatus={formState.errors.npn && FieldStatus.ERROR}
                    />
                  </div>
                </div>
              )}
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Searching...' : 'Search'}
          </Button>
        </form>
        <div className={clsx(styles.content)}>
          {/* @TODO: style this better with designer */}
          {isError && (
            <div>Error searching for producers. Please try again.</div>
          )}
          {isSuccess && data && (
            <PomTable
              headers={tableHeaders}
              rows={tableRows(data.results)}
              emptyRowMessage="No producers found."
            />
          )}
          {isIdle && <FindAProducer />}
        </div>
      </div>
    </div>
  );
};

const FindAProducer = () => {
  return (
    <div className={clsx(styles.findProducer)}>
      <div>
        <Icon type={IconType.SPARKLES} className={clsx(styles.sparklesIcon)} />
      </div>
      <h3>Find a producer.</h3>
      <span>
        Search for a producer using their NPN. We'll return matches here.
      </span>
    </div>
  );
};
